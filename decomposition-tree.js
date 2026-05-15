(function () {
  /* ---------- Defaults ---------- */

  const DEFAULT_SETTINGS = {
    nodeWidth: 250,
    nodeHeight: 58,
    levelGap: 90,
    siblingGap: 16,
    barColor: "#2563eb",
    negativeBarColor: "#dc2626",
    othersBarColor: "#64748b",
    showValues: true,
    showPercentOfParent: true,
    showHoverTooltip: true,
    percentDecimals: 1,

    // Two-measure comparison mode (activated when a second measure is bound).
    higherIsBetter: true,                  // false for cost-style measures
    showPlanBar: true,
    showVariance: true,
    varianceDisplay: "both",               // "percent" | "absolute" | "both"
    favorableColor: "#16a34a",             // green
    unfavorableColor: "#dc2626",           // red
    planBarColor: "#94a3b8",               // neutral grey track

    initialExpandLevel: 1,
    maxVisibleNodes: 500,
    rootLabel: "Total",
    topN: 10,
    enableOthers: true,
    othersLabel: "Others",
    sortDescending: true,

    // Cosmetic colors
    backgroundColor: "#f8fafc",
    nodeBackgroundColor: "#ffffff",
    nodeBorderColor: "#e2e8f0",
    nodeShadowColor: "#0f172a",
    focusBorderColor: "#2563eb",
    labelColor: "#0f172a",
    valueLabelColor: "#475569",
    othersLabelColor: "#475569",
    barBackgroundColor: "#e2e8f0",
    connectorColor: "#cbd5e1",
    toggleBackgroundColor: "#f8fafc",
    toggleBorderColor: "#94a3b8",
    toggleTextColor: "#334155"
  };

  /* ---------- Generic helpers ---------- */

  function toNumber(value) {
    if (value === undefined || value === null || value === "") {
      return 0;
    }
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }
    const normalized = String(value).replace(/,/g, "").replace(/\s/g, "");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  }

  function readCellLabel(cell) {
    if (cell === undefined || cell === null) return "";
    if (typeof cell !== "object") return String(cell);
    return String(
      cell.label ??
      cell.description ??
      cell.formatted ??
      cell.value ??
      cell.id ??
      ""
    );
  }

  function readCellId(cell) {
    if (cell === undefined || cell === null) return "";
    if (typeof cell !== "object") return String(cell);
    return String(
      cell.id ??
      cell.key ??
      cell.raw ??
      cell.rawValue ??
      cell.label ??
      cell.description ??
      ""
    );
  }

  function readMeasureValue(cell) {
    if (cell === undefined || cell === null) return 0;
    if (typeof cell !== "object") return toNumber(cell);
    return toNumber(
      cell.raw ??
      cell.rawValue ??
      cell.value ??
      cell.formatted ??
      0
    );
  }

  function escapeXml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
  }

  function formatNumber(value) {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 1
    }).format(value || 0);
  }

  function formatPercent(fraction, decimals) {
    const d = Math.max(0, Math.min(4, Number.isFinite(decimals) ? decimals : 1));
    if (!Number.isFinite(fraction)) return "—";
    return new Intl.NumberFormat(undefined, {
      style: "percent",
      minimumFractionDigits: d,
      maximumFractionDigits: d
    }).format(fraction);
  }

  function formatSignedNumber(value) {
    if (!Number.isFinite(value)) return "—";
    const v = Math.abs(value);
    const sign = value > 0 ? "+" : value < 0 ? "−" : "";
    return sign + new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 1
    }).format(v);
  }

  function formatSignedPercent(fraction, decimals) {
    if (!Number.isFinite(fraction)) return "—";
    const d = Math.max(0, Math.min(4, Number.isFinite(decimals) ? decimals : 1));
    const v = Math.abs(fraction);
    const sign = fraction > 0 ? "+" : fraction < 0 ? "−" : "";
    return sign + new Intl.NumberFormat(undefined, {
      style: "percent",
      minimumFractionDigits: d,
      maximumFractionDigits: d
    }).format(v);
  }

  function hexToRgba(hex, alpha) {
    if (typeof hex !== "string") return `rgba(0, 0, 0, ${alpha})`;
    const s = hex.trim().replace(/^#/, "");
    let r, g, b;
    if (s.length === 3) {
      r = parseInt(s[0] + s[0], 16);
      g = parseInt(s[1] + s[1], 16);
      b = parseInt(s[2] + s[2], 16);
    } else if (s.length === 6) {
      r = parseInt(s.slice(0, 2), 16);
      g = parseInt(s.slice(2, 4), 16);
      b = parseInt(s.slice(4, 6), 16);
    } else {
      return hex;
    }
    if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
      return `rgba(0, 0, 0, ${alpha})`;
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /* ---------- Tree building ---------- */

  function createNode(id, label, level) {
    return {
      id,
      label,
      level,
      value: 0,
      children: [],
      _childrenById: new Map(),
      _siblingMax: 0,
      isOthers: false,
      hiddenChildrenCount: 0
    };
  }

  function sortChildren(children, sortDescending) {
    return children.sort((a, b) => {
      const diff = Math.abs(b.value) - Math.abs(a.value);
      return sortDescending ? diff : -diff;
    });
  }

  function createOthersNode(hiddenChildren, parentNode, settings) {
    const othersNode = createNode(
      `${parentNode.id}|__others__`,
      settings.othersLabel || "Others",
      parentNode.level + 1
    );
    othersNode.isOthers = true;
    othersNode.hiddenChildrenCount = hiddenChildren.length;
    othersNode.value = hiddenChildren.reduce(
      (sum, child) => sum + toNumber(child.value),
      0
    );
    othersNode.children = [];
    return othersNode;
  }

  function finalizeNode(node, settings) {
    let children = Array.from(node._childrenById.values())
      .map(child => finalizeNode(child, settings));

    children = sortChildren(children, settings.sortDescending);

    const topN = Math.max(0, toNumber(settings.topN));

    if (settings.enableOthers && topN > 0 && children.length > topN) {
      const visibleChildren = children.slice(0, topN);
      const hiddenChildren = children.slice(topN);
      const othersNode = createOthersNode(hiddenChildren, node, settings);
      children = [...visibleChildren, othersNode];
    }

    // Per-parent bar normalization: every child gets stamped with the
    // largest absolute sibling value, so bar widths compare within the
    // sibling group instead of against the global root total.
    if (children.length) {
      const siblingMax = Math.max(
        ...children.map(c => Math.abs(toNumber(c.value)))
      );
      const parentValue = toNumber(node.value);
      children.forEach((c, idx) => {
        c._siblingMax = siblingMax;
        c._pctOfParent = parentValue !== 0 ? toNumber(c.value) / parentValue : 0;
        c._rank = idx + 1;
        c._siblingCount = children.length;
      });
    }

    node.children = children;
    delete node._childrenById;
    return node;
  }

  // Walk the static tree and stamp _pctOfTotal on every node (root = 1).
  // Lazy mode computes this during materialization.
  function stampPctOfTotal(tree) {
    if (!tree.length) return;
    const total = toNumber(tree[0].value);
    const visit = node => {
      node._pctOfTotal = total !== 0 ? toNumber(node.value) / total : 0;
      if (node.children) node.children.forEach(visit);
    };
    tree.forEach(visit);
  }

  function buildTreeFromPathRows(pathRows, settings) {
    const root = createNode("__root__", settings.rootLabel || "Total", 0);

    pathRows.forEach(row => {
      const value = toNumber(row.value);
      const path = Array.isArray(row.path)
        ? row.path.filter(
            part => part !== undefined && part !== null && String(part) !== ""
          )
        : [];

      if (!path.length) return;

      root.value += value;

      let current = root;
      let cumulativeId = "__root__";

      path.forEach((part, index) => {
        const label = String(part);
        const safePart = label || `Level ${index + 1}`;
        cumulativeId += `|${safePart}`;

        if (!current._childrenById.has(cumulativeId)) {
          current._childrenById.set(
            cumulativeId,
            createNode(cumulativeId, safePart, index + 1)
          );
        }

        current = current._childrenById.get(cumulativeId);
        current.value += value;
      });
    });

    const finalizedRoot = finalizeNode(root, settings);
    // Root has no siblings — normalize against itself so its bar fills the card.
    finalizedRoot._siblingMax = Math.abs(toNumber(finalizedRoot.value));
    finalizedRoot._pctOfParent = 1;
    finalizedRoot._rank = 1;
    finalizedRoot._siblingCount = 1;
    const tree = [finalizedRoot];
    stampPctOfTotal(tree);
    return tree;
  }

  function buildTreeFromParentRows(rows, settings) {
    const byId = new Map();
    const root = createNode("__root__", settings.rootLabel || "Total", 0);

    rows.forEach((row, index) => {
      const id = String(row.id ?? `node-${index}`);
      const parentId =
        row.parentId === undefined ||
        row.parentId === null ||
        row.parentId === ""
          ? "__root__"
          : String(row.parentId);

      byId.set(id, {
        id,
        parentId,
        label: String(row.label ?? id),
        value: toNumber(row.value ?? row.actual ?? row.measure),
        children: [],
        _childrenById: new Map(),
        isOthers: false,
        hiddenChildrenCount: 0
      });
    });

    byId.forEach(node => {
      if (node.parentId !== "__root__" && byId.has(node.parentId)) {
        const parent = byId.get(node.parentId);
        parent._childrenById.set(node.id, node);
      } else {
        root._childrenById.set(node.id, node);
      }
    });

    function rollup(node) {
      let total = toNumber(node.value);
      node._childrenById.forEach(child => {
        total += rollup(child);
      });
      node.value = total;
      return total;
    }

    rollup(root);
    const finalizedRoot = finalizeNode(root, settings);
    finalizedRoot._siblingMax = Math.abs(toNumber(finalizedRoot.value));
    finalizedRoot._pctOfParent = 1;
    finalizedRoot._rank = 1;
    finalizedRoot._siblingCount = 1;
    const tree = [finalizedRoot];
    stampPctOfTotal(tree);
    return tree;
  }

  /* ---------- Dimension-aware extraction (drill-by picker) ---------- */

  // Returns a richer shape than the old extractor:
  //   - dimensions:  ordered list of { alias, name } for the feed
  //   - measureAlias: the primary measure (drives the foreground bar)
  //   - planAlias:    optional secondary measure (drives the plan/target track)
  //   - rows:         each binding row with a `cells` object keyed by alias,
  //                   plus a numeric `value` and `valuePlan`
  function extractBindingDataset(binding) {
    if (!binding || !Array.isArray(binding.data) || !binding.metadata) {
      return null;
    }

    const feeds = binding.metadata.feeds || {};
    const dimensionAliases =
      feeds.dimensions && Array.isArray(feeds.dimensions.values)
        ? feeds.dimensions.values
        : [];
    const measureAliases =
      feeds.measures && Array.isArray(feeds.measures.values)
        ? feeds.measures.values
        : [];

    const measureAlias = measureAliases[0];
    if (!dimensionAliases.length || !measureAlias) return null;

    // The second measure is optional. The widget falls back to single-
    // measure rendering when planAlias is absent.
    const planAlias = measureAliases[1] || null;

    // Try to find a human-readable name per dimension from metadata.
    const dimensionsMeta = binding.metadata.dimensions || {};
    const dimensions = dimensionAliases.map(alias => {
      const meta = dimensionsMeta[alias] || {};
      return {
        alias,
        name: String(meta.description || meta.name || alias)
      };
    });

    // Same for measures, used by the hover card and Builder Panel.
    const measuresMeta = binding.metadata.mainStructureMembers || binding.metadata.measures || {};
    const measureName =
      (measuresMeta[measureAlias] &&
        String(measuresMeta[measureAlias].description || measuresMeta[measureAlias].label || measureAlias)) ||
      measureAlias;
    const planName = planAlias
      ? (measuresMeta[planAlias] &&
          String(measuresMeta[planAlias].description || measuresMeta[planAlias].label || planAlias)) ||
        planAlias
      : null;

    const rows = binding.data
      .map(row => {
        const cells = {};
        let anyLabel = false;
        dimensionAliases.forEach(alias => {
          const label = readCellLabel(row[alias]);
          const id = readCellId(row[alias]);
          cells[alias] = { label, id };
          if (label !== "") anyLabel = true;
        });
        const value = readMeasureValue(row[measureAlias]);
        const valuePlan = planAlias ? readMeasureValue(row[planAlias]) : 0;
        return anyLabel ? { cells, value, valuePlan } : null;
      })
      .filter(r => r !== null);

    return { dimensions, measureAlias, planAlias, measureName, planName, rows };
  }

  // Aggregate dataset rows filtered by an arbitrary set of dimension
  // constraints, grouped by a chosen dimension. Returns a sorted array
  // of bucket entries: { id, label, value }.
  //
  //   dataset:     output of extractBindingDataset
  //   filters:     [{ alias, label }, ...] — must match these exactly
  //   groupBy:     alias of the dimension to bucket by
  //   settings:    for topN / sortDescending / enableOthers / othersLabel
  function aggregateByDimension(dataset, filters, groupBy, settings) {
    if (!dataset) return [];

    const buckets = new Map(); // label -> { id, label, value }

    for (const row of dataset.rows) {
      // Apply filters: every constraint must match this row.
      let ok = true;
      for (const f of filters) {
        const cell = row.cells[f.alias];
        if (!cell || cell.label !== f.label) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;

      const cell = row.cells[groupBy];
      if (!cell || cell.label === "") continue;

      const key = cell.label;
      if (!buckets.has(key)) {
        buckets.set(key, {
          id: cell.id || cell.label,
          label: cell.label,
          value: 0,
          valuePlan: 0
        });
      }
      const bucket = buckets.get(key);
      bucket.value += toNumber(row.value);
      bucket.valuePlan += toNumber(row.valuePlan);
    }

    let children = Array.from(buckets.values());

    children.sort((a, b) => {
      const diff = Math.abs(b.value) - Math.abs(a.value);
      return settings.sortDescending ? diff : -diff;
    });

    const topN = Math.max(0, toNumber(settings.topN));
    if (settings.enableOthers && topN > 0 && children.length > topN) {
      const visible = children.slice(0, topN);
      const hidden = children.slice(topN);
      const othersValue = hidden.reduce((s, c) => s + toNumber(c.value), 0);
      const othersPlan  = hidden.reduce((s, c) => s + toNumber(c.valuePlan), 0);
      visible.push({
        id: "__others__",
        label: settings.othersLabel || "Others",
        value: othersValue,
        valuePlan: othersPlan,
        isOthers: true,
        hiddenChildrenCount: hidden.length,
        hiddenLabels: hidden.map(c => c.label)
      });
      children = visible;
    }

    return children;
  }

  // Sum the dataset for a given filter set — used to value the root and
  // any node whose value isn't already known.
  function sumFilteredValue(dataset, filters) {
    if (!dataset) return 0;
    let total = 0;
    for (const row of dataset.rows) {
      let ok = true;
      for (const f of filters) {
        const cell = row.cells[f.alias];
        if (!cell || cell.label !== f.label) {
          ok = false;
          break;
        }
      }
      if (ok) total += toNumber(row.value);
    }
    return total;
  }

  function sumFilteredValuePlan(dataset, filters) {
    if (!dataset || !dataset.planAlias) return 0;
    let total = 0;
    for (const row of dataset.rows) {
      let ok = true;
      for (const f of filters) {
        const cell = row.cells[f.alias];
        if (!cell || cell.label !== f.label) {
          ok = false;
          break;
        }
      }
      if (ok) total += toNumber(row.valuePlan);
    }
    return total;
  }

  /* ---------- Legacy static-path extractor (kept for setData API) ---------- */

  function extractPathRowsFromSacBinding(binding) {
    if (!binding || !Array.isArray(binding.data) || !binding.metadata) {
      return [];
    }

    const feeds = binding.metadata.feeds || {};
    const dimensionAliases =
      feeds.dimensions && Array.isArray(feeds.dimensions.values)
        ? feeds.dimensions.values
        : [];
    const measureAliases =
      feeds.measures && Array.isArray(feeds.measures.values)
        ? feeds.measures.values
        : [];
    const firstMeasureAlias = measureAliases[0];

    if (!dimensionAliases.length || !firstMeasureAlias) return [];

    return binding.data
      .map(row => {
        const path = dimensionAliases
          .map(alias => readCellLabel(row[alias]))
          .filter(label => label !== "");
        const ids = dimensionAliases
          .map(alias => readCellId(row[alias]))
          .filter(id => id !== "");
        const value = readMeasureValue(row[firstMeasureAlias]);
        return { path, ids, value, raw: row };
      })
      .filter(row => row.path.length > 0);
  }

  function computeVisibleNodes(tree, expandedSet) {
    const visible = [];

    function visit(node, level, parentVisibleIndex = null) {
      const visibleIndex = visible.length;
      visible.push({
        ...node,
        level,
        visibleIndex,
        parentVisibleIndex
      });
      if (expandedSet.has(node.id) && node.children) {
        node.children.forEach(child => {
          visit(child, level + 1, visibleIndex);
        });
      }
    }

    tree.forEach(root => visit(root, 0, null));
    return visible;
  }

  function collectNodeIds(tree) {
    const ids = new Set();
    const visit = node => {
      ids.add(node.id);
      if (node.children) node.children.forEach(visit);
    };
    tree.forEach(visit);
    return ids;
  }

  // Property changes are either structural (require rebuilding the tree:
  // Top-N, Others rollup, sort order, root/others labels affect node ids)
  // or cosmetic (colors, sizes, max-visible — only need a re-render).
  // Rebuilding when only a color changes wastes work and used to wipe
  // expansion state.
  const STRUCTURAL_PROPS = new Set([
    "topN",
    "enableOthers",
    "sortDescending",
    "rootLabel",
    "othersLabel"
  ]);

  function hasStructuralChange(changedProperties) {
    if (!changedProperties) return false;
    return Object.keys(changedProperties).some(k => STRUCTURAL_PROPS.has(k));
  }

  /* ---------- Main custom element ---------- */

  class DecompositionTreeWidget extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });

      this._settings = { ...DEFAULT_SETTINGS };

      // Two data modes:
      //   1) Modern: dataset + lazy tree (this._dataset, this._lazyTree)
      //   2) Legacy: pre-built static tree from setData() scripting calls
      //      (this._lastPathRows / this._tree) — backward-compat only.
      this._dataset = null;
      this._lazyTree = null;          // lazy root: { id, label, value, level,
                                      //              filterPath, children?, ... }
      this._lastPathRows = [];
      this._tree = [];                // legacy static tree (setData path)

      this._expanded = new Set();
      this._hasInitialized = false;

      // Sticky-per-level dimension choices.
      // Map<level (1-based), aliasString>. Level 1 = first drill below root.
      this._levelDimensions = new Map();

      // UI state for the picker popup.
      // null when closed; otherwise { nodeId, x, y, w, h, mode: 'expand'|'change' }
      this._picker = null;

      // Hover-card tooltip state. null when hidden; otherwise { nodeId }.
      // Pixel positioning is computed at render time from the node's bbox.
      this._hover = null;
      this._hoverShowTimer = null;
      this._hoverHideTimer = null;

      // Selection state: the node whose filter context is currently
      // being broadcast to the story. Survives re-renders. Cleared
      // automatically if the node no longer exists after refresh.
      this._selectedNodeId = null;

      // Cached bound handlers + cleanup tickets so we don't leak listeners.
      this._docClickHandler = null;
      this._escHandler = null;
    }

    connectedCallback() {
      this.tryRefreshFromBinding();
      this.render();
    }

    onCustomWidgetBeforeUpdate(changedProperties) {
      this._settings = { ...this._settings, ...changedProperties };
      if (hasStructuralChange(changedProperties)) {
        this.rebuildAfterStructuralChange();
      }
    }

    onCustomWidgetAfterUpdate() {
      this.tryRefreshFromBinding();
      this.render();
    }

    onCustomWidgetResize() {
      this.render();
    }

    onCustomWidgetDestroy() {
      this._clearHoverTimers();
      this._teardownGlobalListeners();
      this.shadowRoot.innerHTML = "";
    }

    /* ---------- Data ingest ---------- */

    tryRefreshFromBinding() {
      const binding = this.mainBinding;
      if (!binding) return;

      const dataset = extractBindingDataset(binding);
      if (dataset && dataset.dimensions.length) {
        this._dataset = dataset;
        // Reset legacy mode if we now have a real binding.
        this._tree = [];
        this._lastPathRows = [];

        // Pin the default level-1 dimension up front so the picker at
        // level 2 correctly excludes it from the choices. (Drilling at
        // level 1 from root never offers a picker — by definition, no
        // dimension is in use yet, so the feed-order default applies.)
        if (!this._levelDimensions.has(1) && dataset.dimensions.length) {
          this._levelDimensions.set(1, dataset.dimensions[0].alias);
        }

        this._lazyTree = this._buildLazyRoot();

        if (!this._hasInitialized) {
          this._applyInitialExpansion();
          this._hasInitialized = true;
        } else {
          // Replay the user's expansion choices against the refreshed data.
          // Children that no longer exist are silently dropped.
          this._rehydrateExpandedSubtree(this._lazyTree, 0);
          this._pruneExpandedToLazy();
        }
        return;
      }

      // Fall back to legacy path-row mode for backward compatibility.
      const pathRows = extractPathRowsFromSacBinding(binding);
      if (!pathRows.length) return;

      this._lastPathRows = pathRows;
      this._tree = buildTreeFromPathRows(pathRows, this._settings);
      this._dataset = null;
      this._lazyTree = null;

      if (!this._hasInitialized) {
        this.setExpandedLevel(this._settings.initialExpandLevel, false);
        this._hasInitialized = true;
      } else {
        this._pruneExpandedToTree();
      }
    }

    rebuildAfterStructuralChange() {
      if (this._dataset) {
        // Rebuild root + any already-expanded subtrees with new settings.
        this._lazyTree = this._buildLazyRoot();
        this._rehydrateExpandedSubtree(this._lazyTree, 0);
        this._pruneExpandedToLazy();
      } else if (this._lastPathRows && this._lastPathRows.length) {
        this._tree = buildTreeFromPathRows(this._lastPathRows, this._settings);
        this._pruneExpandedToTree();
      }
    }

    /* ---------- Lazy tree construction ---------- */

    _buildLazyRoot() {
      const s = this._settings;
      const hasPlan = !!(this._dataset && this._dataset.planAlias);
      const totalValue = sumFilteredValue(this._dataset, []);
      const totalPlan = hasPlan ? sumFilteredValuePlan(this._dataset, []) : 0;
      return {
        id: "__root__",
        label: s.rootLabel || "Total",
        level: 0,
        value: totalValue,
        valuePlan: hasPlan ? totalPlan : null,
        _variance: hasPlan ? totalValue - totalPlan : null,
        _variancePct: hasPlan && totalPlan !== 0
          ? (totalValue - totalPlan) / Math.abs(totalPlan)
          : null,
        _siblingMax: Math.abs(totalValue),
        _siblingMaxCombined: hasPlan
          ? Math.max(Math.abs(totalValue), Math.abs(totalPlan))
          : Math.abs(totalValue),
        _pctOfParent: 1,                  // root is 100% of itself
        _pctOfTotal: 1,
        _rank: 1,
        _siblingCount: 1,
        filterPath: [],         // ordered [{alias, label}, ...]
        children: null,         // null = not yet expanded
        isOthers: false,
        hiddenChildrenCount: 0,
        hiddenLabels: null
      };
    }

    // Materialize a node's children using the dimension chosen for the
    // child level. Idempotent — safe to call repeatedly.
    _materializeChildren(node) {
      if (!this._dataset) return;
      if (node.isOthers) return;          // Others has no further drill
      if (node.children !== null) return; // already materialized

      const childLevel = node.level + 1;
      const groupBy = this._dimensionForLevel(childLevel);
      if (!groupBy) {
        node.children = [];               // no more dimensions to drill
        return;
      }

      // If we resolved via the "default = first unused dim" fallback,
      // pin it now. Otherwise descendant levels can't tell which dims
      // are already taken and may try to reuse them.
      if (!this._levelDimensions.has(childLevel)) {
        this._levelDimensions.set(childLevel, groupBy);
      }

      const buckets = aggregateByDimension(
        this._dataset,
        node.filterPath,
        groupBy,
        this._settings
      );

      const hasPlan = !!(this._dataset && this._dataset.planAlias);
      const isLevel1 = node.level === 0;

      // Per-parent bar normalization with one exception: level-1 nodes
      // normalize against the ROOT's value, so their bars correctly show
      // share-of-total. Deeper levels keep per-parent normalization so
      // small siblings remain visible at depth.
      const siblingMax = isLevel1
        ? Math.abs(toNumber(node.value))
        : (buckets.length
            ? Math.max(...buckets.map(b => Math.abs(toNumber(b.value))))
            : 0);
      // Comparison-mode denominator: same hybrid rule but also accounts
      // for the plan track so both bars stay visually comparable.
      const siblingMaxCombined = isLevel1
        ? (hasPlan
            ? Math.max(Math.abs(toNumber(node.value)), Math.abs(toNumber(node.valuePlan)))
            : Math.abs(toNumber(node.value)))
        : (buckets.length
            ? (hasPlan
                ? Math.max(...buckets.map(b => Math.max(
                    Math.abs(toNumber(b.value)),
                    Math.abs(toNumber(b.valuePlan))
                  )))
                : siblingMax)
            : 0);

      const parentValue = toNumber(node.value);
      const totalValue =
        this._lazyTree ? toNumber(this._lazyTree.value) : 0;

      node.children = buckets.map((b, idx) => {
        const v = toNumber(b.value);
        const p = toNumber(b.valuePlan);
        return {
          id: this._idForPath([
            ...node.filterPath,
            { alias: groupBy, label: b.label }
          ]),
          label: b.label,
          level: childLevel,
          value: b.value,
          valuePlan: hasPlan ? b.valuePlan : null,
          _variance: hasPlan ? (v - p) : null,
          _variancePct: hasPlan && p !== 0 ? (v - p) / Math.abs(p) : null,
          _siblingMax: siblingMax,
          _siblingMaxCombined: siblingMaxCombined,
          _pctOfParent: parentValue !== 0 ? v / parentValue : 0,
          _pctOfTotal:  totalValue  !== 0 ? v / totalValue  : 0,
          _rank: idx + 1,
          _siblingCount: buckets.length,
          filterPath: b.isOthers
            ? node.filterPath
            : [...node.filterPath, { alias: groupBy, label: b.label }],
          children: null,
          isOthers: !!b.isOthers,
          hiddenChildrenCount: b.hiddenChildrenCount || 0,
          hiddenLabels: b.hiddenLabels || null
        };
      });
    }

    // After data refresh, walk the existing tree and re-materialize
    // children for every node that was expanded. This lets refreshed
    // data flow into already-open branches without losing them.
    _rehydrateExpandedSubtree(node, depth) {
      if (!node) return;
      if (!this._expanded.has(node.id)) return;
      // Force re-aggregation:
      node.children = null;
      this._materializeChildren(node);
      if (node.children) {
        node.children.forEach(c => this._rehydrateExpandedSubtree(c, depth + 1));
      }
    }

    _dimensionForLevel(level) {
      // level is 1-based (children of root are level 1).
      if (this._levelDimensions.has(level)) {
        return this._levelDimensions.get(level);
      }
      // Default: first not-yet-used dimension in feed order.
      const used = new Set(this._levelDimensions.values());
      const dims = this._dataset ? this._dataset.dimensions : [];
      for (const d of dims) {
        if (!used.has(d.alias)) return d.alias;
      }
      return null;
    }

    // Stable, deterministic node id from filter path. Order matters.
    _idForPath(filterPath) {
      if (!filterPath.length) return "__root__";
      return (
        "__root__|" +
        filterPath.map(f => `${f.alias}=${f.label}`).join("||")
      );
    }

    _applyInitialExpansion() {
      this._expanded.clear();
      const target = Math.max(0, toNumber(this._settings.initialExpandLevel));
      if (target <= 0 || !this._lazyTree) return;

      const visit = (node, depth) => {
        if (depth >= target) return;
        this._expanded.add(node.id);
        this._materializeChildren(node);
        if (node.children) {
          node.children.forEach(c => visit(c, depth + 1));
        }
      };
      visit(this._lazyTree, 0);
    }

    _pruneExpandedToLazy() {
      if (!this._lazyTree) return;
      const valid = new Set();
      const visit = node => {
        valid.add(node.id);
        if (node.children) node.children.forEach(visit);
      };
      visit(this._lazyTree);
      if (this._expanded.size) {
        for (const id of this._expanded) {
          if (!valid.has(id)) this._expanded.delete(id);
        }
      }
      this._dropSelectionIfMissing(valid);
    }

    _pruneExpandedToTree() {
      const validIds = collectNodeIds(this._tree);
      if (this._expanded.size) {
        for (const id of this._expanded) {
          if (!validIds.has(id)) this._expanded.delete(id);
        }
      }
      this._dropSelectionIfMissing(validIds);
    }

    // Silently drop the current selection if the node no longer exists.
    // We DON'T fire onNodeDeselected here — the deselect was caused by
    // data refresh / dim change, not by user intent.
    _dropSelectionIfMissing(validIds) {
      if (this._selectedNodeId && !validIds.has(this._selectedNodeId)) {
        this._selectedNodeId = null;
      }
    }

    _findNodeById(nodeId) {
      if (this._lazyTree) {
        let found = null;
        const visit = node => {
          if (found) return;
          if (node.id === nodeId) {
            found = node;
            return;
          }
          if (node.children) node.children.forEach(visit);
        };
        visit(this._lazyTree);
        return found;
      }
      // Legacy mode
      let found = null;
      const visit = node => {
        if (found) return;
        if (node.id === nodeId) {
          found = node;
          return;
        }
        if (node.children) node.children.forEach(visit);
      };
      this._tree.forEach(visit);
      return found;
    }

    // Returns the set of IDs that should NOT be dimmed when a selection
    // is active: the selected node itself, plus every ancestor leading
    // back to root (so the "you are here" path stays bright).
    _computeSelectionPathIds(positioned, byIndex) {
      const ids = new Set();
      if (!this._selectedNodeId) return ids;
      const selected = positioned.find(p => p.id === this._selectedNodeId);
      if (!selected) return ids;
      let current = selected;
      while (current) {
        ids.add(current.id);
        if (current.parentVisibleIndex === null) break;
        current = byIndex.get(current.parentVisibleIndex) || null;
      }
      return ids;
    }

    /* ---------- Scripting API ---------- */

    expandAll() {
      if (this._lazyTree) {
        const visit = node => {
          this._expanded.add(node.id);
          this._materializeChildren(node);
          if (node.children) node.children.forEach(visit);
        };
        visit(this._lazyTree);
      } else {
        const visit = node => {
          this._expanded.add(node.id);
          if (node.children) node.children.forEach(visit);
        };
        this._tree.forEach(visit);
      }
      this.render();
    }

    collapseAll() {
      this._expanded.clear();
      this.render();
    }

    setExpandedLevel(level = 1, doRender = true) {
      this._expanded.clear();
      if (this._lazyTree) {
        this._settings.initialExpandLevel = level;
        this._applyInitialExpansion();
      } else {
        const visit = (node, currentLevel) => {
          if (currentLevel < level) {
            this._expanded.add(node.id);
            if (node.children) {
              node.children.forEach(child => visit(child, currentLevel + 1));
            }
          }
        };
        this._tree.forEach(root => visit(root, 0));
      }
      if (doRender) this.render();
    }

    setData(rows) {
      // Legacy entry point: bypasses the dataset/lazy model entirely.
      this._dataset = null;
      this._lazyTree = null;

      if (Array.isArray(rows) && rows.length && Array.isArray(rows[0].path)) {
        this._lastPathRows = rows;
        this._tree = buildTreeFromPathRows(rows, this._settings);
      } else if (Array.isArray(rows)) {
        this._lastPathRows = [];
        this._tree = buildTreeFromParentRows(rows, this._settings);
      } else {
        this._lastPathRows = [];
        this._tree = [];
      }
      if (!this._hasInitialized) {
        this.setExpandedLevel(this._settings.initialExpandLevel, false);
        this._hasInitialized = true;
      } else {
        this._pruneExpandedToTree();
      }
      this.render();
    }

    /* ---------- Interaction ---------- */

    // Clicking a node selects it: fires onNodeSelected with the full
    // filter context for the story to consume. Clicking the same node
    // again deselects (fires onNodeDeselected). Clicking the root or
    // an Others bucket clears any active selection — neither represents
    // a usable filter context.
    selectNode(nodeId) {
      const node = this._findNodeById(nodeId);
      if (!node) return;

      // Toggle off
      if (this._selectedNodeId === nodeId) {
        this.clearSelection();
        return;
      }

      // Root / Others don't make sense as a filter source
      if (node.id === "__root__" || node.isOthers) {
        if (this._selectedNodeId) this.clearSelection();
        else this.dispatchEvent(new CustomEvent("onNodeClick", { detail: { nodeId } }));
        return;
      }

      this._selectedNodeId = nodeId;

      const detail = this._buildSelectionDetail(node);

      // Backward-compat: still fire onNodeClick so existing handlers work.
      this.dispatchEvent(new CustomEvent("onNodeClick", { detail }));
      this.dispatchEvent(new CustomEvent("onNodeSelected", { detail }));

      this.render();
    }

    clearSelection() {
      if (!this._selectedNodeId) return;
      const previousId = this._selectedNodeId;
      this._selectedNodeId = null;
      this.dispatchEvent(
        new CustomEvent("onNodeDeselected", { detail: { nodeId: previousId } })
      );
      this.render();
    }

    // Scripting API: programmatically read the current filter context.
    getSelection() {
      if (!this._selectedNodeId) return null;
      const node = this._findNodeById(this._selectedNodeId);
      if (!node) return null;
      return this._buildSelectionDetail(node);
    }

    // Build the payload that goes out in onNodeSelected / onNodeClick.
    // Shape is intentionally story-script-friendly:
    //   {
    //     nodeId, label, value, level,
    //     pctOfParent, pctOfTotal,
    //     filters: [{ dimension, dimensionName, member }, ...],
    //     measure: aliasString
    //   }
    _buildSelectionDetail(node) {
      const filters = (node.filterPath || []).map(f => {
        const dim = this._dataset
          ? this._dataset.dimensions.find(d => d.alias === f.alias)
          : null;
        return {
          dimension: f.alias,
          dimensionName: dim ? dim.name : f.alias,
          member: f.label
        };
      });
      const hasPlan = !!(this._dataset && this._dataset.planAlias);
      return {
        nodeId: node.id,
        label: node.label,
        value: node.value,
        level: node.level,
        pctOfParent: node._pctOfParent,
        pctOfTotal: node._pctOfTotal,
        filters,
        measure: this._dataset ? this._dataset.measureAlias : null,
        // Comparison-mode fields (null when no second measure is bound):
        planMeasure: hasPlan ? this._dataset.planAlias : null,
        valuePlan:   hasPlan ? toNumber(node.valuePlan) : null,
        variance:    hasPlan ? toNumber(node._variance) : null,
        variancePct: hasPlan ? node._variancePct : null
      };
    }

    toggleNode(nodeId) {
      const node = this._findNodeById(nodeId);
      if (!node) return;

      if (this._expanded.has(nodeId)) {
        this._expanded.delete(nodeId);
        this.dispatchEvent(
          new CustomEvent("onNodeCollapse", { detail: { nodeId } })
        );
        this.render();
        return;
      }

      // Lazy mode: opening a node materializes its children if needed.
      if (this._lazyTree && !node.isOthers) {
        const childLevel = node.level + 1;
        const hasDimForLevel = this._levelDimensions.has(childLevel);
        const availableDims = this._availableDimsForLevel(childLevel);

        // Sticky-per-level: if no dim chosen yet AND there's more than
        // one available, show the picker. Otherwise just expand.
        if (!hasDimForLevel && availableDims.length > 1) {
          this._openPicker(nodeId, "expand");
          return;
        }
        this._materializeChildren(node);
      }

      this._expanded.add(nodeId);
      this.dispatchEvent(
        new CustomEvent("onNodeExpand", { detail: { nodeId } })
      );
      this.render();
    }

    _availableDimsForLevel(level) {
      if (!this._dataset) return [];
      const used = new Set();
      for (const [lvl, alias] of this._levelDimensions) {
        if (lvl !== level) used.add(alias);
      }
      return this._dataset.dimensions.filter(d => !used.has(d.alias));
    }

    _openPicker(nodeId, mode) {
      this._hideHoverNow();
      this._picker = { nodeId, mode };
      this.render();
    }

    _closePicker() {
      if (!this._picker) return;
      this._picker = null;
      this.render();
    }

    // User picked a dimension for the level below `nodeId`.
    // sticky-per-level: applies to ALL siblings at that level.
    _choosePickerDimension(nodeId, alias) {
      const node = this._findNodeById(nodeId);
      if (!node) {
        this._closePicker();
        return;
      }
      const childLevel = node.level + 1;
      const previous = this._levelDimensions.get(childLevel);

      this._levelDimensions.set(childLevel, alias);

      // If this is a "change" (level had a different choice before),
      // collapse anything below this level since the data underneath
      // is now organized differently. Then re-materialize at this level.
      if (previous && previous !== alias) {
        this._collapseBelowLevel(childLevel);
      }

      // Invalidate already-materialized siblings at this level so they
      // re-aggregate with the new dimension.
      this._invalidateChildrenAtLevel(this._lazyTree, childLevel);

      // Expand the originating node.
      this._materializeChildren(node);
      this._expanded.add(nodeId);

      this._picker = null;
      this.dispatchEvent(
        new CustomEvent("onNodeExpand", { detail: { nodeId } })
      );
      this.render();
    }

    _invalidateChildrenAtLevel(node, level) {
      if (!node) return;
      if (node.level + 1 === level) {
        node.children = null;
        return;
      }
      if (node.children) {
        node.children.forEach(c => this._invalidateChildrenAtLevel(c, level));
      }
    }

    // Remove any expansion at or below the given level (root is level 0).
    _collapseBelowLevel(level) {
      if (!this._lazyTree) return;
      const toDelete = [];
      const visit = node => {
        if (node.level >= level) toDelete.push(node.id);
        if (node.children) node.children.forEach(visit);
      };
      visit(this._lazyTree);
      toDelete.forEach(id => this._expanded.delete(id));
      // If the selected node lived at or below the affected level, its
      // filter context is no longer meaningful — drop it silently.
      if (this._selectedNodeId && toDelete.includes(this._selectedNodeId)) {
        this._selectedNodeId = null;
      }
    }

    /* ---------- Visual helpers ---------- */

    getNodeColor(node) {
      if (node.isOthers) return this._settings.othersBarColor;
      if (node.value < 0) return this._settings.negativeBarColor;
      return this._settings.barColor;
    }

    getNodeTitle(node) {
      if (node.isOthers && node.hiddenChildrenCount) {
        return `${node.label} (${node.hiddenChildrenCount} hidden members) | Value: ${formatNumber(node.value)}`;
      }
      // Surface which dimension this node represents, when known.
      const dimLabel = this._dimensionDisplayForNode(node);
      const prefix = dimLabel ? `${dimLabel}: ` : "";
      return `${prefix}${node.label} | Value: ${formatNumber(node.value)}`;
    }

    _dimensionDisplayForNode(node) {
      if (!this._dataset || !node || node.level === 0) return "";
      const alias = this._dimensionForLevel(node.level);
      if (!alias) return "";
      const dim = this._dataset.dimensions.find(d => d.alias === alias);
      return dim ? dim.name : "";
    }

    getNodeDisplayLabel(node) {
      if (node.isOthers && node.hiddenChildrenCount) {
        return `${node.label} (${node.hiddenChildrenCount})`;
      }
      return node.label;
    }

    // Compact variance text for the node card: respects the
    // varianceDisplay setting (percent / absolute / both).
    _formatVarianceShort(absVar, pctVar) {
      const s = this._settings;
      const mode = s.varianceDisplay || "both";
      const pctStr = Number.isFinite(pctVar)
        ? formatSignedPercent(pctVar, s.percentDecimals)
        : null;
      const absStr = formatSignedNumber(absVar);

      if (mode === "percent") return pctStr || absStr;
      if (mode === "absolute") return absStr;
      // "both" — prefer percent when defined, else fall back to absolute
      return pctStr ? `${pctStr} (${absStr})` : absStr;
    }

    /* ---------- Render ---------- */

    render() {
      if (!this.shadowRoot) return;

      const s = this._settings;
      const rootTree = this._lazyTree ? [this._lazyTree] : this._tree;
      const visible = computeVisibleNodes(rootTree, this._expanded);

      if (!visible.length) {
        this.shadowRoot.innerHTML = "";
        this._teardownGlobalListeners();
        return;
      }

      if (visible.length > s.maxVisibleNodes) {
        this.shadowRoot.innerHTML =
          this.styles() +
          `<div class="state">
            Too many nodes to display (${visible.length}).
            Collapse levels, reduce Top-N, or apply filters.
          </div>`;
        this._teardownGlobalListeners();
        return;
      }

      const positioned = visible.map((node, rowIndex) => ({
        ...node,
        x: 20 + node.level * (s.nodeWidth + s.levelGap),
        y: 20 + rowIndex * (s.nodeHeight + s.siblingGap),
        width: s.nodeWidth,
        height: s.nodeHeight
      }));

      const maxLevel = Math.max(0, ...positioned.map(n => n.level));
      const width = Math.max(
        700,
        40 + (maxLevel + 1) * (s.nodeWidth + s.levelGap)
      );
      const height = Math.max(
        240,
        40 + positioned.length * (s.nodeHeight + s.siblingGap)
      );

      const byIndex = new Map(positioned.map(n => [n.visibleIndex, n]));

      const connectors = positioned
        .filter(
          n => n.parentVisibleIndex !== null && byIndex.has(n.parentVisibleIndex)
        )
        .map(n => {
          const p = byIndex.get(n.parentVisibleIndex);
          const x1 = p.x + p.width;
          const y1 = p.y + p.height / 2;
          const x2 = n.x;
          const y2 = n.y + n.height / 2;
          const mid = (x1 + x2) / 2;
          return `<path class="connector" d="M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}" />`;
        })
        .join("");

      const inLazyMode = !!this._lazyTree;

      // Selection-path set: ids that are either the selected node or
      // direct ancestors of it. Used to keep the path highlighted while
      // siblings off-path get a subtle dim treatment.
      const selectionPathIds = this._computeSelectionPathIds(positioned, byIndex);
      const hasSelection = !!this._selectedNodeId && selectionPathIds.size > 0;

      const hasPlan = !!(this._dataset && this._dataset.planAlias);
      const inComparisonMode = hasPlan && s.showPlanBar !== false;

      const nodes = positioned
        .map(node => {
          const barX = node.x + 14;
          const barY = node.y + 31;
          const barWidthMax = node.width - 28;

          // In comparison mode the actual and plan bars share a denominator
          // (the per-sibling-group max across both measures). Falls back
          // gracefully when valuePlan / _siblingMaxCombined are missing.
          const denom = inComparisonMode
            ? Math.max(1, Math.abs(node._siblingMaxCombined ?? node._siblingMax ?? node.value ?? 1))
            : Math.max(1, Math.abs(node._siblingMax ?? node.value ?? 1));

          const barWidth = Math.max(0, (Math.abs(node.value) / denom) * barWidthMax);
          const planWidth = inComparisonMode
            ? Math.max(0, (Math.abs(toNumber(node.valuePlan)) / denom) * barWidthMax)
            : 0;

          // Variance "favorability": higherIsBetter flips the sign meaning.
          // Variance is value - plan; favorable when positive AND higher-is-better,
          // OR when negative AND lower-is-better.
          const variance = inComparisonMode ? toNumber(node._variance) : 0;
          const variancePct = inComparisonMode ? node._variancePct : null;
          const hasMeaningfulVariance =
            inComparisonMode &&
            node.level > 0 &&
            (variance !== 0 || (Number.isFinite(variancePct) && variancePct !== 0));
          const isFavorable = s.higherIsBetter !== false ? variance >= 0 : variance <= 0;
          const varianceColor = hasMeaningfulVariance
            ? (isFavorable ? s.favorableColor : s.unfavorableColor)
            : s.valueLabelColor;

          const isSelected = node.id === this._selectedNodeId;
          const isOnPath = selectionPathIds.has(node.id);
          const isDimmed = hasSelection && !isOnPath;

          // In lazy mode a node "has children" if it could be drilled
          // (not Others, and there's a dimension available for the next
          // level). In static mode we trust the prebuilt children.
          let hasChildren;
          if (inLazyMode) {
            hasChildren = !node.isOthers &&
              !!this._dimensionForLevel(node.level + 1);
          } else {
            hasChildren = node.children && node.children.length > 0;
          }

          const expanded = this._expanded.has(node.id);
          const fill = this.getNodeColor(node);
          const displayLabel = this.getNodeDisplayLabel(node);

          // "Change dimension" affordance: small icon, only in lazy mode,
          // only on nodes whose child level has more than one alternative.
          const showChangeIcon =
            inLazyMode &&
            !node.isOthers &&
            this._availableDimsForLevel(node.level + 1).length > 1;

          const dimLabel = inLazyMode ? this._dimensionDisplayForNode(node) : "";

          return `
            <g
              class="dt-node ${node.isOthers ? "others-node" : ""} ${isSelected ? "selected" : ""} ${isOnPath && !isSelected ? "on-path" : ""} ${isDimmed ? "dimmed" : ""}"
              data-node-id="${escapeXml(node.id)}"
              data-has-children="${hasChildren ? "true" : "false"}"
              tabindex="0"
              role="button"
              aria-label="${escapeXml(displayLabel)}"
            >
              <rect
                class="node-card"
                x="${node.x}"
                y="${node.y}"
                width="${node.width}"
                height="${node.height}"
                rx="10"
              ></rect>

              ${
                hasChildren
                  ? `
                    <g class="toggle" data-action="toggle" data-node-id="${escapeXml(node.id)}">
                      <circle cx="${node.x + 14}" cy="${node.y + 19}" r="9"></circle>
                      <text x="${node.x + 14}" y="${node.y + 23}" text-anchor="middle">${expanded ? "−" : "+"}</text>
                    </g>
                  `
                  : ""
              }

              <text class="node-label" x="${node.x + (hasChildren ? 30 : 14)}" y="${node.y + 23}">${escapeXml(displayLabel)}</text>

              ${
                dimLabel
                  ? `<text class="dim-tag" x="${node.x + node.width - 14}" y="${node.y + 14}" text-anchor="end">${escapeXml(dimLabel)}</text>`
                  : ""
              }

              <rect class="bar-bg" x="${barX}" y="${barY}" width="${barWidthMax}" height="9" rx="4.5"></rect>
              ${
                inComparisonMode
                  ? `<rect class="bar-plan" x="${barX}" y="${barY}" width="${planWidth}" height="9" rx="4.5" fill="${s.planBarColor}"></rect>`
                  : ""
              }
              <rect class="bar-value" x="${barX}" y="${barY}" width="${barWidth}" height="9" rx="4.5" fill="${fill}"></rect>

              ${
                s.showValues !== false
                  ? `<text class="value-label" x="${barX}" y="${node.y + 52}">${formatNumber(node.value)}</text>`
                  : ""
              }

              ${
                /* Right-side small label: in comparison mode, the variance
                   replaces % of parent (variance is the more useful number
                   when comparing two measures). The hover card always shows
                   both. */
                inComparisonMode && s.showVariance !== false && hasMeaningfulVariance
                  ? `<text class="var-label" x="${node.x + node.width - 14}" y="${node.y + 52}" text-anchor="end" fill="${varianceColor}">${escapeXml(this._formatVarianceShort(variance, variancePct))}</text>`
                  : (s.showPercentOfParent !== false &&
                     node.level > 0 &&
                     Number.isFinite(node._pctOfParent)
                      ? `<text class="pct-label" x="${node.x + node.width - 14}" y="${node.y + 52}" text-anchor="end">${escapeXml(formatPercent(node._pctOfParent, s.percentDecimals))}</text>`
                      : "")
              }

              ${
                showChangeIcon
                  ? `
                    <g class="change-dim" data-action="change-dim" data-node-id="${escapeXml(node.id)}">
                      <title>Change dimension at this level</title>
                      <rect x="${node.x + node.width - 26}" y="${node.y + node.height - 22}" width="18" height="14" rx="3"></rect>
                      <text x="${node.x + node.width - 17}" y="${node.y + node.height - 11}" text-anchor="middle">⋯</text>
                    </g>
                  `
                  : ""
              }
            </g>
          `;
        })
        .join("");

      // Picker overlay (HTML over SVG so we get easy hit testing + scroll).
      const pickerHtml = this._renderPickerHtml(positioned);
      const hoverHtml = this._renderHoverCardHtml(positioned, width);
      const bannerHtml = this._renderSelectionBannerHtml();

      this.shadowRoot.innerHTML =
        this.styles() +
        `
          <div class="viewport">
            ${bannerHtml}
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Decomposition tree">
              ${connectors}
              ${nodes}
            </svg>
            ${hoverHtml}
            ${pickerHtml}
          </div>
        `;

      this._wireViewportEvents();
      this._wireGlobalListeners();
    }

    _renderSelectionBannerHtml() {
      if (!this._selectedNodeId) return "";
      const node = this._findNodeById(this._selectedNodeId);
      if (!node) return "";

      let pathText = "";
      if (node.filterPath && node.filterPath.length) {
        pathText = node.filterPath.map(f => escapeXml(f.label)).join(" › ");
      } else {
        pathText = escapeXml(node.label);
      }

      return `
        <div class="selection-banner" role="status">
          <span class="sb-icon" aria-hidden="true">●</span>
          <span class="sb-label">Filtering by</span>
          <span class="sb-path">${pathText}</span>
          <button
            type="button"
            class="sb-clear"
            data-action="clear-selection"
            aria-label="Clear selection"
          >Clear ✕</button>
        </div>
      `;
    }

    _renderHoverCardHtml(positioned, viewportWidth) {
      if (!this._settings.showHoverTooltip) return "";
      if (!this._hover) return "";
      const target = positioned.find(p => p.id === this._hover.nodeId);
      if (!target) return "";

      const s = this._settings;
      const node = this._findNodeById(this._hover.nodeId) || target;

      // Position: prefer right of the node card. If it would overflow the
      // SVG width, flip to the left.
      const cardW = 240;
      const gap = 10;
      let left = target.x + target.width + gap;
      let arrowSide = "left";
      if (left + cardW > viewportWidth) {
        left = target.x - cardW - gap;
        arrowSide = "right";
      }
      const top = target.y;

      // Build path breadcrumbs (lazy mode only — static mode has no path).
      let pathHtml = "";
      if (node.filterPath && node.filterPath.length) {
        const crumbs = node.filterPath.map(f => escapeXml(f.label)).join(" › ");
        pathHtml = `<div class="hc-path">${crumbs}</div>`;
      }

      const dimName = this._lazyTree ? this._dimensionDisplayForNode(node) : "";
      const dimRow = dimName
        ? `<div class="hc-dim">${escapeXml(dimName)}</div>`
        : "";

      const hasPlan = !!(this._dataset && this._dataset.planAlias);
      const inComparisonMode = hasPlan && s.showPlanBar !== false;
      const measureName = this._dataset ? (this._dataset.measureName || "Value") : "Value";
      const planName = this._dataset && this._dataset.planName ? this._dataset.planName : "Plan";

      const valueRow = `
        <div class="hc-row hc-row-main">
          <span class="hc-row-label">${escapeXml(measureName)}</span>
          <span class="hc-row-value">${formatNumber(node.value)}</span>
        </div>
      `;

      // Comparison-mode rows: plan value + signed variance.
      let comparisonRows = "";
      if (inComparisonMode && node.level >= 0) {
        const planVal = toNumber(node.valuePlan);
        const variance = toNumber(node._variance);
        const variancePct = node._variancePct;
        const isFavorable = s.higherIsBetter !== false ? variance >= 0 : variance <= 0;
        const varColor = variance === 0
          ? s.valueLabelColor
          : (isFavorable ? s.favorableColor : s.unfavorableColor);

        comparisonRows = `
          <div class="hc-row">
            <span class="hc-row-label">${escapeXml(planName)}</span>
            <span class="hc-row-value">${formatNumber(planVal)}</span>
          </div>
          <div class="hc-row">
            <span class="hc-row-label">Variance</span>
            <span class="hc-row-value" style="color:${varColor}">${escapeXml(formatSignedNumber(variance))}</span>
          </div>
          ${
            Number.isFinite(variancePct)
              ? `
                <div class="hc-row">
                  <span class="hc-row-label">Variance %</span>
                  <span class="hc-row-value" style="color:${varColor}">${escapeXml(formatSignedPercent(variancePct, s.percentDecimals))}</span>
                </div>
              `
              : ""
          }
        `;
      }

      const pctParentRow =
        node.level > 0 && Number.isFinite(node._pctOfParent)
          ? `
            <div class="hc-row">
              <span class="hc-row-label">% of parent</span>
              <span class="hc-row-value">${escapeXml(formatPercent(node._pctOfParent, s.percentDecimals))}</span>
            </div>
          `
          : "";

      const pctTotalRow =
        node.level > 0 && Number.isFinite(node._pctOfTotal)
          ? `
            <div class="hc-row">
              <span class="hc-row-label">% of total</span>
              <span class="hc-row-value">${escapeXml(formatPercent(node._pctOfTotal, s.percentDecimals))}</span>
            </div>
          `
          : "";

      const rankRow =
        node.level > 0 && node._rank && node._siblingCount
          ? `
            <div class="hc-row">
              <span class="hc-row-label">Rank</span>
              <span class="hc-row-value">${node._rank} of ${node._siblingCount}</span>
            </div>
          `
          : "";

      const othersRow =
        node.isOthers && node.hiddenChildrenCount
          ? `
            <div class="hc-row">
              <span class="hc-row-label">Hidden members</span>
              <span class="hc-row-value">${node.hiddenChildrenCount}</span>
            </div>
          `
          : "";

      return `
        <div class="hover-card hc-arrow-${arrowSide}" style="left:${left}px; top:${top}px; width:${cardW}px;">
          ${pathHtml}
          ${dimRow}
          <div class="hc-title">${escapeXml(this.getNodeDisplayLabel(node))}</div>
          ${valueRow}
          ${comparisonRows}
          ${pctParentRow}
          ${pctTotalRow}
          ${rankRow}
          ${othersRow}
        </div>
      `;
    }

    _renderPickerHtml(positioned) {
      if (!this._picker) return "";
      const target = positioned.find(p => p.id === this._picker.nodeId);
      if (!target) return "";

      const childLevel = target.level + 1;
      const available = this._availableDimsForLevel(childLevel);
      const current = this._levelDimensions.get(childLevel);

      if (!available.length) return "";

      const top = target.y + target.height + 6;
      const left = target.x + 14;

      const items = available
        .map(d => {
          const isActive = d.alias === current;
          return `
            <button
              type="button"
              class="picker-item ${isActive ? "active" : ""}"
              data-action="pick-dim"
              data-node-id="${escapeXml(target.id)}"
              data-alias="${escapeXml(d.alias)}"
            >
              <span class="picker-check">${isActive ? "✓" : ""}</span>
              <span class="picker-name">${escapeXml(d.name)}</span>
            </button>
          `;
        })
        .join("");

      const titleText =
        this._picker.mode === "change"
          ? "Change dimension at this level"
          : "Drill by…";

      return `
        <div class="picker" style="left:${left}px; top:${top}px;">
          <div class="picker-title">${escapeXml(titleText)}</div>
          ${items}
        </div>
      `;
    }

    /* ---------- Event wiring ---------- */

    _wireViewportEvents() {
      const root = this.shadowRoot.querySelector(".viewport");
      if (!root) return;

      root.addEventListener("click", event => {
        const clearEl = event.target.closest("[data-action='clear-selection']");
        if (clearEl) {
          event.preventDefault();
          event.stopPropagation();
          this.clearSelection();
          return;
        }

        const pickEl = event.target.closest("[data-action='pick-dim']");
        if (pickEl) {
          event.preventDefault();
          event.stopPropagation();
          const nodeId = pickEl.getAttribute("data-node-id");
          const alias = pickEl.getAttribute("data-alias");
          if (nodeId && alias) this._choosePickerDimension(nodeId, alias);
          return;
        }

        const changeEl = event.target.closest("[data-action='change-dim']");
        if (changeEl) {
          event.preventDefault();
          event.stopPropagation();
          const nodeId = changeEl.getAttribute("data-node-id");
          if (nodeId) this._openPicker(nodeId, "change");
          return;
        }

        const toggleEl = event.target.closest("[data-action='toggle']");
        if (toggleEl) {
          event.preventDefault();
          event.stopPropagation();
          const nodeId = toggleEl.getAttribute("data-node-id");
          if (nodeId) this.toggleNode(nodeId);
          return;
        }

        const nodeEl = event.target.closest(".dt-node");
        if (nodeEl) {
          event.preventDefault();
          event.stopPropagation();
          const nodeId = nodeEl.getAttribute("data-node-id");
          if (nodeId) this.selectNode(nodeId);
        }
      });

      this.shadowRoot.querySelectorAll(".dt-node").forEach(el => {
        const nodeId = el.getAttribute("data-node-id");

        el.addEventListener("keydown", event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            const hasChildren = el.getAttribute("data-has-children") === "true";
            if (hasChildren && nodeId) this.toggleNode(nodeId);
          }
        });

        // Hover-card: delayed show, fast hide. Picker takes priority —
        // we suppress the hover while the picker is open.
        el.addEventListener("mouseenter", () => {
          if (!this._settings.showHoverTooltip) return;
          if (this._picker) return;
          this._scheduleHoverShow(nodeId);
        });
        el.addEventListener("mouseleave", () => {
          this._scheduleHoverHide();
        });
        // Show immediately on keyboard focus (accessibility).
        el.addEventListener("focus", () => {
          if (!this._settings.showHoverTooltip) return;
          if (this._picker) return;
          this._showHoverNow(nodeId);
        });
        el.addEventListener("blur", () => {
          this._hideHoverNow();
        });
      });
    }

    _scheduleHoverShow(nodeId) {
      this._clearHoverTimers();
      this._hoverShowTimer = setTimeout(() => {
        this._showHoverNow(nodeId);
      }, 250);
    }

    _scheduleHoverHide() {
      this._clearHoverTimers();
      // Short grace period so moving the cursor *into* the hover card
      // doesn't immediately dismiss it. Hover card isn't interactive
      // right now, but the grace period also smooths over tiny
      // mouseenter/mouseleave flickers at card edges.
      this._hoverHideTimer = setTimeout(() => {
        this._hideHoverNow();
      }, 100);
    }

    _showHoverNow(nodeId) {
      this._clearHoverTimers();
      if (this._hover && this._hover.nodeId === nodeId) return;
      this._hover = { nodeId };
      this._renderHoverOnly();
    }

    _hideHoverNow() {
      this._clearHoverTimers();
      if (!this._hover) return;
      this._hover = null;
      this._renderHoverOnly();
    }

    _clearHoverTimers() {
      if (this._hoverShowTimer) {
        clearTimeout(this._hoverShowTimer);
        this._hoverShowTimer = null;
      }
      if (this._hoverHideTimer) {
        clearTimeout(this._hoverHideTimer);
        this._hoverHideTimer = null;
      }
    }

    // Targeted DOM update: swap only the hover card overlay so we don't
    // re-render the entire SVG (which would re-attach all listeners and
    // cost focus/scroll). The picker uses full re-render because it
    // changes far less often.
    _renderHoverOnly() {
      const viewport = this.shadowRoot.querySelector(".viewport");
      if (!viewport) return;
      const existing = viewport.querySelector(".hover-card");
      if (existing) existing.remove();

      if (!this._hover) return;

      // Recompute positioning data the same way render() does.
      const s = this._settings;
      const rootTree = this._lazyTree ? [this._lazyTree] : this._tree;
      const visible = computeVisibleNodes(rootTree, this._expanded);
      const positioned = visible.map((node, rowIndex) => ({
        ...node,
        x: 20 + node.level * (s.nodeWidth + s.levelGap),
        y: 20 + rowIndex * (s.nodeHeight + s.siblingGap),
        width: s.nodeWidth,
        height: s.nodeHeight
      }));
      const maxLevel = Math.max(0, ...positioned.map(n => n.level));
      const width = Math.max(700, 40 + (maxLevel + 1) * (s.nodeWidth + s.levelGap));

      const html = this._renderHoverCardHtml(positioned, width);
      if (!html) return;

      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      const card = tmp.firstElementChild;
      if (card) viewport.appendChild(card);
    }

    _wireGlobalListeners() {
      // Close the picker on outside click or Escape. We attach to the
      // shadow root (clicks inside) and to document (clicks outside the
      // widget entirely).
      this._teardownGlobalListeners();
      if (!this._picker) return;

      const onDocClick = event => {
        const path = event.composedPath ? event.composedPath() : [];
        if (path.includes(this)) {
          // Inside the host — check if it landed in the picker itself.
          const picker = this.shadowRoot.querySelector(".picker");
          if (picker && path.includes(picker)) return;
          // Inside host but outside picker: close.
        }
        this._closePicker();
      };
      const onEsc = event => {
        if (event.key === "Escape") this._closePicker();
      };

      this._docClickHandler = onDocClick;
      this._escHandler = onEsc;

      // Defer to next tick so the click that opened the picker doesn't
      // immediately close it.
      setTimeout(() => {
        if (this._docClickHandler === onDocClick) {
          document.addEventListener("click", onDocClick, true);
          document.addEventListener("keydown", onEsc, true);
        }
      }, 0);
    }

    _teardownGlobalListeners() {
      if (this._docClickHandler) {
        document.removeEventListener("click", this._docClickHandler, true);
        this._docClickHandler = null;
      }
      if (this._escHandler) {
        document.removeEventListener("keydown", this._escHandler, true);
        this._escHandler = null;
      }
    }

    /* ---------- Styles ---------- */

    styles() {
      const s = this._settings;
      const shadowRgba = hexToRgba(s.nodeShadowColor, 0.18);
      return `
        <style>
          :host {
            display: block;
            width: 100%;
            height: 100%;
            min-height: 240px;
            color: ${s.labelColor};
            font-family: Arial, sans-serif;
          }
          .viewport {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: auto;
            background: ${s.backgroundColor};
            border-radius: 8px;
          }
          .state {
            padding: 16px;
            color: ${s.valueLabelColor};
            background: ${s.backgroundColor};
            border: 1px solid ${s.nodeBorderColor};
            border-radius: 8px;
          }
          .node-card {
            fill: ${s.nodeBackgroundColor};
            stroke: ${s.nodeBorderColor};
            filter: drop-shadow(0 1px 2px ${shadowRgba});
          }
          .others-node .node-card { stroke-dasharray: 4 3; }
          .node-label {
            font-size: 12px;
            font-weight: 600;
            fill: ${s.labelColor};
            pointer-events: none;
          }
          .others-node .node-label { fill: ${s.othersLabelColor}; }
          .value-label {
            font-size: 11px;
            fill: ${s.valueLabelColor};
            pointer-events: none;
          }
          .pct-label {
            font-size: 11px;
            font-weight: 600;
            fill: ${s.labelColor};
            pointer-events: none;
            opacity: 0.85;
          }
          .dim-tag {
            font-size: 9px;
            font-weight: 600;
            letter-spacing: 0.03em;
            text-transform: uppercase;
            fill: ${s.valueLabelColor};
            opacity: 0.7;
            pointer-events: none;
          }
          .bar-bg { fill: ${s.barBackgroundColor}; pointer-events: none; }
          .bar-plan { pointer-events: none; opacity: 0.55; }
          .bar-value { pointer-events: none; }
          .var-label {
            font-size: 11px;
            font-weight: 700;
            pointer-events: none;
          }
          .connector {
            stroke: ${s.connectorColor};
            stroke-width: 1.3;
            fill: none;
            pointer-events: none;
          }
          .toggle { cursor: pointer; pointer-events: all; }
          .toggle circle {
            fill: ${s.toggleBackgroundColor};
            stroke: ${s.toggleBorderColor};
            pointer-events: all;
          }
          .toggle text {
            font-size: 13px;
            fill: ${s.toggleTextColor};
            pointer-events: none;
            user-select: none;
          }
          .change-dim { cursor: pointer; pointer-events: all; }
          .change-dim rect {
            fill: ${s.toggleBackgroundColor};
            stroke: ${s.toggleBorderColor};
            opacity: 0;
            transition: opacity 120ms ease;
          }
          .change-dim text {
            font-size: 12px;
            font-weight: 700;
            fill: ${s.toggleTextColor};
            opacity: 0;
            transition: opacity 120ms ease;
            user-select: none;
          }
          .dt-node:hover .change-dim rect,
          .dt-node:hover .change-dim text,
          .dt-node:focus .change-dim rect,
          .dt-node:focus .change-dim text { opacity: 1; }
          .dt-node { cursor: pointer; outline: none; pointer-events: all; }
          .dt-node .toggle { cursor: pointer; }
          .dt-node:focus .node-card { stroke: ${s.focusBorderColor}; stroke-width: 2; }

          /* Selection states */
          .dt-node.selected .node-card {
            stroke: ${s.focusBorderColor};
            stroke-width: 2.5;
            filter: drop-shadow(0 2px 6px ${hexToRgba(s.focusBorderColor, 0.35)});
          }
          .dt-node.selected .node-label { fill: ${s.focusBorderColor}; }
          .dt-node.on-path .node-card { stroke: ${s.focusBorderColor}; stroke-width: 1.5; }
          .dt-node.dimmed {
            opacity: 0.42;
            transition: opacity 140ms ease;
          }
          .dt-node.dimmed:hover { opacity: 0.85; }

          .picker {
            position: absolute;
            min-width: 180px;
            background: ${s.nodeBackgroundColor};
            border: 1px solid ${s.nodeBorderColor};
            border-radius: 8px;
            box-shadow: 0 8px 24px ${hexToRgba(s.nodeShadowColor, 0.22)};
            padding: 6px;
            z-index: 10;
            font-size: 12px;
            color: ${s.labelColor};
          }
          .picker-title {
            padding: 4px 8px 6px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: ${s.valueLabelColor};
            border-bottom: 1px solid ${s.nodeBorderColor};
            margin-bottom: 4px;
          }
          .picker-item {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            padding: 6px 8px;
            background: transparent;
            border: 0;
            border-radius: 4px;
            text-align: left;
            cursor: pointer;
            font: inherit;
            color: inherit;
          }
          .picker-item:hover { background: ${s.backgroundColor}; }
          .picker-item.active { background: ${s.backgroundColor}; font-weight: 600; }
          .picker-check {
            display: inline-block;
            width: 12px;
            color: ${s.focusBorderColor};
            font-weight: 700;
          }
          .picker-name { flex: 1 1 auto; }

          .hover-card {
            position: absolute;
            background: ${s.nodeBackgroundColor};
            border: 1px solid ${s.nodeBorderColor};
            border-radius: 8px;
            box-shadow: 0 8px 24px ${hexToRgba(s.nodeShadowColor, 0.22)};
            padding: 10px 12px;
            z-index: 9;
            font-size: 12px;
            color: ${s.labelColor};
            pointer-events: none;
            animation: hc-fade 120ms ease-out;
          }
          @keyframes hc-fade {
            from { opacity: 0; transform: translateY(-2px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .hc-path {
            font-size: 10px;
            color: ${s.valueLabelColor};
            margin-bottom: 4px;
            line-height: 1.3;
            word-break: break-word;
          }
          .hc-dim {
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: ${s.valueLabelColor};
            opacity: 0.8;
            margin-bottom: 2px;
          }
          .hc-title {
            font-size: 13px;
            font-weight: 700;
            color: ${s.labelColor};
            margin-bottom: 8px;
            line-height: 1.25;
          }
          .hc-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 3px 0;
            font-size: 11px;
          }
          .hc-row-label { color: ${s.valueLabelColor}; }
          .hc-row-value { font-weight: 600; color: ${s.labelColor}; }
          .hc-row-main {
            border-bottom: 1px solid ${s.nodeBorderColor};
            margin-bottom: 4px;
            padding-bottom: 5px;
          }
          .hc-row-main .hc-row-value { font-size: 13px; }

          .selection-banner {
            position: sticky;
            top: 0;
            left: 0;
            z-index: 8;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            margin: 0 0 4px;
            background: ${hexToRgba(s.focusBorderColor, 0.08)};
            border-bottom: 1px solid ${hexToRgba(s.focusBorderColor, 0.25)};
            font-size: 12px;
            color: ${s.labelColor};
          }
          .sb-icon {
            color: ${s.focusBorderColor};
            font-size: 14px;
            line-height: 1;
          }
          .sb-label {
            color: ${s.valueLabelColor};
            font-weight: 600;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            font-size: 10px;
          }
          .sb-path {
            flex: 1 1 auto;
            font-weight: 600;
            color: ${s.focusBorderColor};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .sb-clear {
            flex: 0 0 auto;
            background: transparent;
            border: 1px solid ${hexToRgba(s.focusBorderColor, 0.4)};
            color: ${s.focusBorderColor};
            border-radius: 4px;
            padding: 3px 8px;
            cursor: pointer;
            font: inherit;
            font-size: 11px;
            font-weight: 600;
          }
          .sb-clear:hover { background: ${hexToRgba(s.focusBorderColor, 0.12)}; }
        </style>
      `;
    }
  }

  /* ---------- Styling panel (Builder Panel) ----------
     Renders form controls bound to manifest properties. Each control,
     on change, fires a 'propertiesChanged' CustomEvent which SAC routes
     back into the main widget's onCustomWidgetBeforeUpdate hook. */

  const STYLING_FIELDS = [
    { section: "Layout" },
    { prop: "nodeWidth",             label: "Node width (px)",          type: "number",  min: 80,  max: 600 },
    { prop: "nodeHeight",            label: "Node height (px)",         type: "number",  min: 30,  max: 200 },
    { prop: "levelGap",              label: "Gap between levels (px)",  type: "number",  min: 0,   max: 400 },
    { prop: "siblingGap",            label: "Gap between siblings (px)",type: "number",  min: 0,   max: 200 },

    { section: "Bars" },
    { prop: "barColor",              label: "Bar color (positive)",     type: "color"  },
    { prop: "negativeBarColor",      label: "Bar color (negative)",     type: "color"  },
    { prop: "othersBarColor",        label: "Bar color (Others)",       type: "color"  },
    { prop: "barBackgroundColor",    label: "Bar track (empty) color",  type: "color"  },

    { section: "Comparison mode (when 2nd measure is bound)" },
    { prop: "showPlanBar",           label: "Show plan/target overlay", type: "boolean" },
    { prop: "showVariance",          label: "Show variance on nodes",   type: "boolean" },
    { prop: "varianceDisplay",       label: "Variance shows",           type: "select", options: [
      { value: "both",     label: "Percent + absolute" },
      { value: "percent",  label: "Percent only" },
      { value: "absolute", label: "Absolute only" }
    ]},
    { prop: "higherIsBetter",        label: "Higher value is better",   type: "boolean" },
    { prop: "favorableColor",        label: "Favorable variance color", type: "color"  },
    { prop: "unfavorableColor",      label: "Unfavorable variance color",type: "color" },
    { prop: "planBarColor",          label: "Plan/target bar color",    type: "color"  },

    { section: "Background" },
    { prop: "backgroundColor",       label: "Widget background",        type: "color"  },

    { section: "Node card" },
    { prop: "nodeBackgroundColor",   label: "Card fill",                type: "color"  },
    { prop: "nodeBorderColor",       label: "Card border",              type: "color"  },
    { prop: "nodeShadowColor",       label: "Card shadow",              type: "color"  },
    { prop: "focusBorderColor",      label: "Card border when focused", type: "color"  },

    { section: "Labels" },
    { prop: "labelColor",            label: "Node label color",         type: "color"  },
    { prop: "valueLabelColor",       label: "Value label color",        type: "color"  },
    { prop: "othersLabelColor",      label: "Others label color",       type: "color"  },

    { section: "Connectors" },
    { prop: "connectorColor",        label: "Connector line color",     type: "color"  },

    { section: "Toggle button (+/−)" },
    { prop: "toggleBackgroundColor", label: "Toggle fill",              type: "color"  },
    { prop: "toggleBorderColor",     label: "Toggle border",            type: "color"  },
    { prop: "toggleTextColor",       label: "Toggle text",              type: "color"  },

    { section: "Display" },
    { prop: "showValues",            label: "Show value labels",        type: "boolean" },
    { prop: "showPercentOfParent",   label: "Show % of parent on nodes",type: "boolean" },
    { prop: "showHoverTooltip",      label: "Show hover tooltip",       type: "boolean" },
    { prop: "percentDecimals",       label: "Percent decimals",         type: "number", min: 0, max: 4 },
    { prop: "rootLabel",             label: "Root label",               type: "text"    },
    { prop: "initialExpandLevel",    label: "Initial expand level",     type: "number", min: 0, max: 20 },
    { prop: "maxVisibleNodes",       label: "Max visible nodes",        type: "number", min: 10, max: 5000 },

    { section: "Top-N / Others" },
    { prop: "topN",                  label: "Top N per parent",         type: "number", min: 0, max: 100 },
    { prop: "enableOthers",          label: "Roll up rest into Others", type: "boolean" },
    { prop: "othersLabel",           label: "Others label",             type: "text"    },
    { prop: "sortDescending",        label: "Sort descending by value", type: "boolean" }
  ];

  class DecompositionTreeStyling extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._props = { ...DEFAULT_SETTINGS };
      this._rendered = false;
      this.render();
    }

    /* SAC pushes the current property values here whenever the panel is
       opened or properties change elsewhere. Merge them, then refresh
       only the affected controls (preserving focus/caret if the user
       is editing something else). */
    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = { ...this._props, ...changedProperties };
      this.syncControls();
    }

    onCustomWidgetAfterUpdate(changedProperties) {
      this._props = { ...this._props, ...changedProperties };
      this.syncControls();
    }

    /* Push a single property change up to SAC. */
    emitChange(prop, value) {
      this._props[prop] = value;
      this.dispatchEvent(
        new CustomEvent("propertiesChanged", {
          detail: { properties: { [prop]: value } }
        })
      );
    }

    /* Update each control's displayed value from this._props without
       wiping the DOM (and without re-attaching listeners). */
    syncControls() {
      if (!this._rendered) return;

      STYLING_FIELDS.forEach(field => {
        if (!field.prop) return;

        const el = this.shadowRoot.querySelector(
          `[data-prop="${field.prop}"]`
        );
        if (!el) return;

        const current = this._props[field.prop];

        if (field.type === "boolean") {
          if (el.checked !== Boolean(current)) {
            el.checked = Boolean(current);
          }
        } else if (field.type === "number") {
          const next = String(current ?? "");
          if (document.activeElement !== el && el.value !== next) {
            el.value = next;
          }
        } else {
          const next = String(current ?? "");
          if (document.activeElement !== el && el.value !== next) {
            el.value = next;
          }
        }
      });
    }

    render() {
      const rowsHtml = STYLING_FIELDS
        .map(field => {
          if (field.section) {
            return `<div class="section-title">${escapeXml(field.section)}</div>`;
          }

          const current = this._props[field.prop];
          const safeProp = escapeXml(field.prop);
          const labelHtml = escapeXml(field.label);

          if (field.type === "boolean") {
            const checked = current ? "checked" : "";
            return `
              <label class="row row-toggle">
                <span class="label">${labelHtml}</span>
                <input
                  type="checkbox"
                  data-prop="${safeProp}"
                  ${checked}
                />
              </label>
            `;
          }

          if (field.type === "color") {
            const val = escapeXml(current ?? "#000000");
            return `
              <label class="row">
                <span class="label">${labelHtml}</span>
                <input
                  type="color"
                  data-prop="${safeProp}"
                  value="${val}"
                />
              </label>
            `;
          }

          if (field.type === "number") {
            const val = escapeXml(current ?? "");
            const min = field.min != null ? `min="${field.min}"` : "";
            const max = field.max != null ? `max="${field.max}"` : "";
            return `
              <label class="row">
                <span class="label">${labelHtml}</span>
                <input
                  type="number"
                  data-prop="${safeProp}"
                  value="${val}"
                  ${min} ${max}
                />
              </label>
            `;
          }

          if (field.type === "select") {
            const options = (field.options || [])
              .map(opt => {
                const selected = String(current) === String(opt.value) ? "selected" : "";
                return `<option value="${escapeXml(opt.value)}" ${selected}>${escapeXml(opt.label)}</option>`;
              })
              .join("");
            return `
              <label class="row">
                <span class="label">${labelHtml}</span>
                <select data-prop="${safeProp}">
                  ${options}
                </select>
              </label>
            `;
          }

          // text
          const val = escapeXml(current ?? "");
          return `
            <label class="row">
              <span class="label">${labelHtml}</span>
              <input
                type="text"
                data-prop="${safeProp}"
                value="${val}"
              />
            </label>
          `;
        })
        .join("");

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            padding: 10px 12px 14px;
            font-family: "72", "72full", Arial, sans-serif;
            color: #1d2d3e;
            font-size: 12px;
            background: #ffffff;
          }
          .section-title {
            margin: 12px 0 6px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: #556b82;
            border-bottom: 1px solid #e5e9ef;
            padding-bottom: 4px;
          }
          .section-title:first-child { margin-top: 0; }
          .row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin: 6px 0;
          }
          .row .label {
            flex: 1 1 auto;
            color: #1d2d3e;
          }
          .row input[type="number"],
          .row input[type="text"] {
            flex: 0 0 110px;
            padding: 4px 6px;
            border: 1px solid #bfc8d4;
            border-radius: 4px;
            font: inherit;
            color: inherit;
            background: #ffffff;
            box-sizing: border-box;
          }
          .row input[type="number"]:focus,
          .row input[type="text"]:focus {
            outline: none;
            border-color: #0a6ed1;
            box-shadow: 0 0 0 1px #0a6ed1;
          }
          .row input[type="color"] {
            flex: 0 0 40px;
            height: 24px;
            padding: 0;
            border: 1px solid #bfc8d4;
            border-radius: 4px;
            background: #ffffff;
            cursor: pointer;
          }
          .row-toggle {
            cursor: pointer;
          }
          .row input[type="checkbox"] {
            flex: 0 0 auto;
            width: 16px;
            height: 16px;
            cursor: pointer;
            accent-color: #0a6ed1;
          }
          .row select {
            flex: 0 0 160px;
            padding: 4px 6px;
            border: 1px solid #bfc8d4;
            border-radius: 4px;
            font: inherit;
            color: inherit;
            background: #ffffff;
            cursor: pointer;
            box-sizing: border-box;
          }
          .row select:focus {
            outline: none;
            border-color: #0a6ed1;
            box-shadow: 0 0 0 1px #0a6ed1;
          }
        </style>
        ${rowsHtml}
      `;

      this._rendered = true;
      this.wireEvents();
    }

    wireEvents() {
      this.shadowRoot
        .querySelectorAll("[data-prop]")
        .forEach(input => {
          const prop = input.getAttribute("data-prop");
          const field = STYLING_FIELDS.find(f => f.prop === prop);
          if (!field) return;

          if (field.type === "boolean") {
            input.addEventListener("change", () => {
              this.emitChange(prop, Boolean(input.checked));
            });
          } else if (field.type === "number") {
            input.addEventListener("change", () => {
              const n = Number(input.value);
              this.emitChange(prop, Number.isFinite(n) ? n : 0);
            });
          } else if (field.type === "color") {
            input.addEventListener("change", () => {
              this.emitChange(prop, String(input.value || ""));
            });
          } else if (field.type === "select") {
            input.addEventListener("change", () => {
              this.emitChange(prop, String(input.value ?? ""));
            });
          } else {
            input.addEventListener("change", () => {
              this.emitChange(prop, String(input.value ?? ""));
            });
          }
        });
    }
  }

  /* ---------- Register elements ---------- */

  if (!customElements.get("com-company-decomposition-tree-v3")) {
    customElements.define(
      "com-company-decomposition-tree-v3",
      DecompositionTreeWidget
    );
  }

  if (!customElements.get("com-company-decomposition-tree-v3-styling")) {
    customElements.define(
      "com-company-decomposition-tree-v3-styling",
      DecompositionTreeStyling
    );
  }
})();
