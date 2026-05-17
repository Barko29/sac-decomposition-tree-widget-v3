(function () {
  /* ---------- Defaults ---------- */

  const DEFAULT_SETTINGS = {
    nodeWidth: 250,
    nodeHeight: 58,
    levelGap: 90,
    siblingGap: 16,
    paddingLeft: 14,
    paddingRight: 14,
    labelTagGap: 8,
    showDimensionTag: true,
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

    // Theme & density presets
    themePreset: "light",                   // "custom" | "light" | "dark" | "horizon" | "highContrast" | "printFriendly"
    densityMode: "comfortable",             // "compact" | "comfortable" | "spacious"

    // Conditional formatting rules (array of rule objects, stored as JSON string in SAC)
    conditionalFormattingRules: "[]",

    // Export controls
    showExportPng: true,
    showExportCsv: true,

    // Interaction controls
    enableNodeDrag: true,
    enableZoomPan: true,

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

  /* ---------- Theme presets ---------- */

  const THEME_PRESETS = {
    custom: { label: "Custom" },           // no overrides — user's manual choices
    light: {
      label: "Light",
      values: {
        backgroundColor: "#f8fafc",
        nodeBackgroundColor: "#ffffff",
        nodeBorderColor: "#e2e8f0",
        nodeShadowColor: "#0f172a",
        focusBorderColor: "#2563eb",
        labelColor: "#0f172a",
        valueLabelColor: "#475569",
        othersLabelColor: "#475569",
        barColor: "#2563eb",
        negativeBarColor: "#dc2626",
        othersBarColor: "#64748b",
        barBackgroundColor: "#e2e8f0",
        connectorColor: "#cbd5e1",
        toggleBackgroundColor: "#f8fafc",
        toggleBorderColor: "#94a3b8",
        toggleTextColor: "#334155",
        favorableColor: "#16a34a",
        unfavorableColor: "#dc2626",
        planBarColor: "#94a3b8"
      }
    },
    dark: {
      label: "Dark",
      values: {
        backgroundColor: "#0f172a",
        nodeBackgroundColor: "#1e293b",
        nodeBorderColor: "#334155",
        nodeShadowColor: "#000000",
        focusBorderColor: "#60a5fa",
        labelColor: "#f1f5f9",
        valueLabelColor: "#94a3b8",
        othersLabelColor: "#94a3b8",
        barColor: "#3b82f6",
        negativeBarColor: "#f87171",
        othersBarColor: "#64748b",
        barBackgroundColor: "#334155",
        connectorColor: "#475569",
        toggleBackgroundColor: "#1e293b",
        toggleBorderColor: "#475569",
        toggleTextColor: "#cbd5e1",
        favorableColor: "#4ade80",
        unfavorableColor: "#f87171",
        planBarColor: "#64748b"
      }
    },
    horizon: {
      label: "SAP Horizon",
      values: {
        backgroundColor: "#f5f6f7",
        nodeBackgroundColor: "#ffffff",
        nodeBorderColor: "#d9d9d9",
        nodeShadowColor: "#223548",
        focusBorderColor: "#0070f2",
        labelColor: "#223548",
        valueLabelColor: "#556b82",
        othersLabelColor: "#556b82",
        barColor: "#0070f2",
        negativeBarColor: "#cc1919",
        othersBarColor: "#758ca4",
        barBackgroundColor: "#e5e5e5",
        connectorColor: "#bcc3ca",
        toggleBackgroundColor: "#f5f6f7",
        toggleBorderColor: "#bcc3ca",
        toggleTextColor: "#223548",
        favorableColor: "#188918",
        unfavorableColor: "#cc1919",
        planBarColor: "#758ca4"
      }
    },
    highContrast: {
      label: "High Contrast",
      values: {
        backgroundColor: "#000000",
        nodeBackgroundColor: "#1a1a1a",
        nodeBorderColor: "#ffffff",
        nodeShadowColor: "#000000",
        focusBorderColor: "#ffff00",
        labelColor: "#ffffff",
        valueLabelColor: "#cccccc",
        othersLabelColor: "#cccccc",
        barColor: "#00bfff",
        negativeBarColor: "#ff4444",
        othersBarColor: "#aaaaaa",
        barBackgroundColor: "#333333",
        connectorColor: "#666666",
        toggleBackgroundColor: "#1a1a1a",
        toggleBorderColor: "#ffffff",
        toggleTextColor: "#ffffff",
        favorableColor: "#00ff00",
        unfavorableColor: "#ff4444",
        planBarColor: "#999999"
      }
    },
    printFriendly: {
      label: "Print-friendly",
      values: {
        backgroundColor: "#ffffff",
        nodeBackgroundColor: "#ffffff",
        nodeBorderColor: "#999999",
        nodeShadowColor: "#666666",
        focusBorderColor: "#333333",
        labelColor: "#000000",
        valueLabelColor: "#333333",
        othersLabelColor: "#333333",
        barColor: "#333333",
        negativeBarColor: "#999999",
        othersBarColor: "#bbbbbb",
        barBackgroundColor: "#e0e0e0",
        connectorColor: "#999999",
        toggleBackgroundColor: "#ffffff",
        toggleBorderColor: "#999999",
        toggleTextColor: "#333333",
        favorableColor: "#006600",
        unfavorableColor: "#cc0000",
        planBarColor: "#999999"
      }
    }
  };

  /* ---------- Density modes ---------- */

  const DENSITY_MODES = {
    compact: {
      label: "Compact",
      values: { nodeWidth: 200, nodeHeight: 44, levelGap: 60, siblingGap: 10 }
    },
    comfortable: {
      label: "Comfortable",
      values: { nodeWidth: 250, nodeHeight: 58, levelGap: 90, siblingGap: 16 }
    },
    spacious: {
      label: "Spacious",
      values: { nodeWidth: 320, nodeHeight: 72, levelGap: 120, siblingGap: 24 }
    }
  };

  /* ---------- Conditional formatting engine ---------- */

  // Each rule: { field, operator, value, action, actionValue }
  //   field:      "value" | "variance" | "variancePct" | "pctOfParent" | "pctOfTotal" | "rank"
  //   operator:   "<" | "<=" | ">" | ">=" | "==" | "!="
  //   value:      number (user enters -0.1 for −10%, rank 3, etc.)
  //   action:     "barColor" | "labelBold" | "labelColor" | "cardBorder" | "cardBackground" | "hide"
  //   actionValue: string (hex) or boolean (true) depending on action
  //
  // Rules are evaluated top-to-bottom; all matching rules accumulate
  // (later rules can override earlier ones for the same action).

  const CF_OPERATORS = [
    { value: "<",  label: "<  less than" },
    { value: "<=", label: "≤  at most" },
    { value: ">",  label: ">  greater than" },
    { value: ">=", label: "≥  at least" },
    { value: "==", label: "=  equals" },
    { value: "!=", label: "≠  not equal" }
  ];

  const CF_FIELDS = [
    { value: "value",       label: "Value" },
    { value: "variance",    label: "Variance (abs)" },
    { value: "variancePct", label: "Variance %" },
    { value: "pctOfParent", label: "% of parent" },
    { value: "pctOfTotal",  label: "% of total" },
    { value: "rank",        label: "Rank" }
  ];

  const CF_ACTIONS = [
    { value: "barColor",       label: "Bar color",        type: "color" },
    { value: "labelBold",      label: "Bold label",       type: "boolean" },
    { value: "labelColor",     label: "Label color",      type: "color" },
    { value: "cardBorder",     label: "Card border color", type: "color" },
    { value: "cardBackground", label: "Card background",  type: "color" },
    { value: "hide",           label: "Hide node",        type: "boolean" }
  ];

  function evaluateCondition(operator, fieldValue, threshold) {
    switch (operator) {
      case "<":  return fieldValue <  threshold;
      case "<=": return fieldValue <= threshold;
      case ">":  return fieldValue >  threshold;
      case ">=": return fieldValue >= threshold;
      // Use epsilon tolerance for float equality (pctOfParent, variancePct, etc.)
      case "==": return Math.abs(fieldValue - threshold) < 1e-9;
      case "!=": return Math.abs(fieldValue - threshold) >= 1e-9;
      default:   return false;
    }
  }

  function getNodeFieldValue(node, field) {
    switch (field) {
      case "value":       return toNumber(node.value);
      case "variance":    return toNumber(node._variance);
      case "variancePct": return node._variancePct ?? 0;
      case "pctOfParent": return node._pctOfParent ?? 0;
      case "pctOfTotal":  return node._pctOfTotal ?? 0;
      case "rank":        return node._rank ?? 0;
      default:            return 0;
    }
  }

  // Evaluate all rules for a single node. Returns an object of actions
  // that matched, keyed by action type:
  //   { barColor: "#dc2626", labelBold: true, hide: true, ... }
  function evaluateConditionalFormatting(node, rules) {
    if (!rules || !rules.length) return null;
    if (node.level === 0) return null;   // don't format root

    let result = null;

    for (const rule of rules) {
      if (!rule.field || !rule.operator || !rule.action) continue;
      const fieldValue = getNodeFieldValue(node, rule.field);
      const threshold = toNumber(rule.value);

      if (evaluateCondition(rule.operator, fieldValue, threshold)) {
        if (!result) result = {};
        result[rule.action] = rule.actionValue ?? true;
      }
    }
    return result;
  }

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
    if (value === null || value === undefined) return "—";
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 1
    }).format(toNumber(value));
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
    return [...children].sort((a, b) => {
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

    // Share-of-parent normalization: a child's bar is sized by its
    // share of the parent's value, so bar width and "% of parent"
    // label always agree.
    if (children.length) {
      const parentValue = toNumber(node.value);
      const siblingMax = Math.abs(parentValue);
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
      if (node._childrenById.size === 0) {
        // Leaf node: keep its own value.
        return toNumber(node.value);
      }
      // Intermediate/root: value = sum of children only.
      // This avoids double-counting when input data has both
      // parent-level and leaf-level values.
      let total = 0;
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
  //   parentId:    id of the parent node (for unique Others id)
  function aggregateByDimension(dataset, filters, groupBy, settings, parentId) {
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
        id: parentId + "|__others__",
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
      // Intentionally omit children from the spread to avoid
      // leaking mutable array references into the flat list.
      visible.push({
        id: node.id,
        label: node.label,
        value: node.value,
        valuePlan: node.valuePlan,
        isOthers: node.isOthers,
        hiddenChildrenCount: node.hiddenChildrenCount,
        hiddenLabels: node.hiddenLabels,
        filterPath: node.filterPath,
        _siblingMax: node._siblingMax,
        _siblingMaxCombined: node._siblingMaxCombined,
        _pctOfParent: node._pctOfParent,
        _pctOfTotal: node._pctOfTotal,
        _rank: node._rank,
        _siblingCount: node._siblingCount,
        _variance: node._variance,
        _variancePct: node._variancePct,
        level,
        visibleIndex,
        parentVisibleIndex,
        _hasChildren: !!(node.children && node.children.length > 0)
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

      // Parsed conditional formatting rules (computed from JSON string).
      this._cfRules = [];

      // Render cache: avoid recomputing positions for hover card updates.
      this._cachedPositioned = null;
      this._cachedWidth = 700;

      // Node drag offsets: Map<nodeId, { dx, dy }>.
      // Applied on top of the computed default positions.
      this._nodeOffsets = new Map();
      this._dragState = null;  // { nodeId, startMouseX, startMouseY, startDx, startDy }

      // Zoom/pan state
      this._zoom = 1;
      this._panX = 0;
      this._panY = 0;
      this._panState = null;   // { startMouseX, startMouseY, startPanX, startPanY }
    }

    _parseCfRules() {
      try {
        const raw = this._settings.conditionalFormattingRules;
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        this._cfRules = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        this._cfRules = [];
      }
    }

    connectedCallback() {
      this._parseCfRules();
      this.tryRefreshFromBinding();
      this.render();
    }

    onCustomWidgetBeforeUpdate(changedProperties) {
      // Theme preset: if changed, apply its palette before merging
      if (changedProperties.themePreset &&
          changedProperties.themePreset !== "custom") {
        const preset = THEME_PRESETS[changedProperties.themePreset];
        if (preset && preset.values) {
          this._settings = { ...this._settings, ...preset.values };
        }
      }

      // Density mode: if changed, apply its layout values
      if (changedProperties.densityMode) {
        const density = DENSITY_MODES[changedProperties.densityMode];
        if (density && density.values) {
          this._settings = { ...this._settings, ...density.values };
        }
      }

      this._settings = { ...this._settings, ...changedProperties };

      // Parse conditional formatting rules from JSON string
      if (changedProperties.conditionalFormattingRules !== undefined) {
        this._parseCfRules();
      }

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
      if (this._zoomRenderTimer) { clearTimeout(this._zoomRenderTimer); this._zoomRenderTimer = null; }
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

        // Prune stale _levelDimensions entries: if a dimension was
        // removed from the binding feed, drop any level pinned to it.
        const validAliases = new Set(dataset.dimensions.map(d => d.alias));
        for (const [lvl, alias] of this._levelDimensions) {
          if (!validAliases.has(alias)) {
            this._levelDimensions.delete(lvl);
          }
        }

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
        // Share-of-parent normalization: a node's bar uses its parent's
        // value (or max of parent value/plan in comparison mode) as
        // denominator. Root has no parent — normalize against itself.
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
        this._settings,
        node.id
      );

      const hasPlan = !!(this._dataset && this._dataset.planAlias);

      // Share-of-parent normalization at every level: a child's bar is
      // sized by its share of the parent's value. The parent's bar drives
      // the denominator, so bar width and "% of parent" label always match.
      const parentValue = toNumber(node.value);
      const parentValuePlan = hasPlan ? toNumber(node.valuePlan) : 0;
      const siblingMax = Math.abs(parentValue);
      // Comparison-mode denominator: use parent's max(actual, plan) so the
      // overlay plan bar is on the same scale as the actual bar.
      const siblingMaxCombined = hasPlan
        ? Math.max(Math.abs(parentValue), Math.abs(parentValuePlan))
        : siblingMax;

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
      // Only count dimensions at levels that are actually reachable
      // (i.e. their parent level is currently expanded). Stale sticky
      // choices at collapsed levels must not block drill-by.
      const used = this._activeLevelDimensions(level);
      const dims = this._dataset ? this._dataset.dimensions : [];
      for (const d of dims) {
        if (!used.has(d.alias)) return d.alias;
      }
      return null;
    }

    // Returns the set of dimension aliases that are "actively in use"
    // at levels other than `excludeLevel`. A level is active if either
    // (a) some node at that level's parent is currently expanded, or
    // (b) the level is an ancestor of `excludeLevel` (the path the
    //     user is trying to drill into).
    _activeLevelDimensions(excludeLevel) {
      const active = new Set();
      for (const [lvl, alias] of this._levelDimensions) {
        if (lvl === excludeLevel) continue;
        // A level is "active" if some node at level (lvl - 1) is expanded,
        // meaning its children at `lvl` are visible. Also always keep
        // ancestor levels (< excludeLevel) since they define the path.
        if (lvl < excludeLevel || this._isLevelInUseCached(lvl)) {
          active.add(alias);
        }
      }
      return active;
    }

    // Cached wrapper: avoids repeated tree walks within a single render cycle.
    _isLevelInUseCached(level) {
      if (!this._levelInUseCache) this._levelInUseCache = new Map();
      if (this._levelInUseCache.has(level)) return this._levelInUseCache.get(level);
      const result = this._isLevelInUse(level);
      this._levelInUseCache.set(level, result);
      return result;
    }

    // Invalidate the cache at the start of each render/toggle cycle.
    _clearLevelInUseCache() {
      this._levelInUseCache = null;
    }

    // Check whether any node at (level - 1) is currently expanded,
    // meaning children at `level` are actually visible in the tree.
    _isLevelInUse(level) {
      if (level <= 1) return this._expanded.has("__root__");
      // Walk the lazy tree to find any expanded node at (level - 1).
      if (!this._lazyTree) return false;
      let found = false;
      const visit = node => {
        if (found) return;
        if (node.level === level - 1 && this._expanded.has(node.id)) {
          found = true;
          return;
        }
        if (node.children && this._expanded.has(node.id)) {
          node.children.forEach(visit);
        }
      };
      visit(this._lazyTree);
      return found;
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

    /**
     * expandPath(labels, options?)
     *
     * Programmatically drill into the tree along a member-label path.
     *
     *   widget.expandPath(["EMEA", "Germany", "Widget A"]);
     *
     * Each element is matched by label against materialized children at
     * the corresponding level.  The method materializes children lazily
     * as it walks, so the path does NOT need to be pre-expanded.
     *
     * Options (all optional):
     *   select:  boolean (default true) — select the deepest reached node
     *   scroll:  boolean (default true) — scroll the node into view
     *
     * Returns { ok, depth, nodeId }:
     *   ok:     true if the FULL path was matched
     *   depth:  how many levels were successfully matched (0 = none)
     *   nodeId: id of the deepest matched node (null if depth === 0)
     */
    expandPath(labels, options) {
      if (!Array.isArray(labels) || !labels.length) {
        return { ok: false, depth: 0, nodeId: null };
      }
      const opts = { select: true, scroll: true, ...(options || {}) };

      // Always start from root
      if (!this._lazyTree && !this._tree.length) {
        return { ok: false, depth: 0, nodeId: null };
      }

      const inLazy = !!this._lazyTree;
      let current = inLazy ? this._lazyTree : this._tree[0];
      if (!current) return { ok: false, depth: 0, nodeId: null };

      // Expand root first
      this._expanded.add(current.id);
      if (inLazy) this._materializeChildren(current);

      let matchedDepth = 0;
      let lastMatchedNode = current;

      for (let i = 0; i < labels.length; i++) {
        const targetLabel = String(labels[i]);

        if (!current.children || !current.children.length) break;

        // Find the child whose label matches (case-sensitive)
        const child = current.children.find(
          c => c.label === targetLabel
        );

        if (!child) break;

        matchedDepth = i + 1;
        lastMatchedNode = child;

        // Expand this child so its subtree is visible
        this._expanded.add(child.id);
        if (inLazy) this._materializeChildren(child);

        current = child;
      }

      const ok = matchedDepth === labels.length;

      // Optionally select the deepest matched node
      if (opts.select && lastMatchedNode && lastMatchedNode.id !== "__root__") {
        this._selectedNodeId = lastMatchedNode.id;
        const detail = this._buildSelectionDetail(lastMatchedNode);
        this.dispatchEvent(new CustomEvent("onNodeSelected", { detail }));
      }

      this.render();

      // Optionally scroll the target node into view
      if (opts.scroll && lastMatchedNode) {
        const raf = typeof requestAnimationFrame === "function" ? requestAnimationFrame : null;
        if (raf) {
          const targetId = lastMatchedNode.id;
          raf(() => {
            const el = this.shadowRoot.querySelector(
              `[data-node-id="${targetId.replace(/["\\]/g, '\\$&')}"]`
            );
            if (el && typeof el.scrollIntoView === "function") {
              el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
            }
          });
        }
      }

      return { ok, depth: matchedDepth, nodeId: lastMatchedNode ? lastMatchedNode.id : null };
    }

    /**
     * getState()
     *
     * Returns a plain, JSON-serializable object capturing the current
     * UI state of the widget:
     *
     *   {
     *     expanded:        [ ...nodeId strings ],
     *     levelDimensions: { "1": "dim_region", "2": "dim_country" },
     *     selectedNodeId:  "..." | null
     *   }
     *
     * Intended for SAC bookmark persistence and scripting save/restore.
     */
    getState() {
      const levelDims = {};
      for (const [lvl, alias] of this._levelDimensions) {
        levelDims[String(lvl)] = alias;
      }
      return {
        expanded: Array.from(this._expanded),
        levelDimensions: levelDims,
        selectedNodeId: this._selectedNodeId || null
      };
    }

    /**
     * setState(state)
     *
     * Restores the widget to a previously saved state (from getState).
     * Re-materializes all expanded subtrees against the current dataset,
     * so it works correctly even if the data has changed since the state
     * was saved (missing nodes are silently skipped).
     *
     * Fires onNodeSelected if the restored state includes a selection.
     */
    setState(state) {
      if (!state || typeof state !== "object") return;

      // Restore level-dimension choices
      this._levelDimensions.clear();
      if (state.levelDimensions && typeof state.levelDimensions === "object") {
        for (const [lvl, alias] of Object.entries(state.levelDimensions)) {
          const n = Number(lvl);
          if (Number.isFinite(n) && typeof alias === "string") {
            this._levelDimensions.set(n, alias);
          }
        }
      }

      // Restore expansion: clear current, set target IDs, then
      // re-materialize the lazy tree to hydrate the path.
      this._expanded.clear();
      const targetIds = new Set(
        Array.isArray(state.expanded) ? state.expanded : []
      );

      if (this._lazyTree) {
        // Walk the lazy tree top-down. For each node whose id is in
        // targetIds, expand it and materialize its children so the
        // next level can be matched.
        const visit = node => {
          if (targetIds.has(node.id)) {
            this._expanded.add(node.id);
            this._materializeChildren(node);
            if (node.children) {
              node.children.forEach(visit);
            }
          }
        };
        visit(this._lazyTree);
      } else {
        // Static mode: just set the IDs, pruned against actual tree.
        for (const id of targetIds) {
          this._expanded.add(id);
        }
        this._pruneExpandedToTree();
      }

      // Restore selection
      this._selectedNodeId = null;
      if (state.selectedNodeId) {
        const node = this._findNodeById(state.selectedNodeId);
        if (node && node.id !== "__root__" && !node.isOthers) {
          this._selectedNodeId = node.id;
          const detail = this._buildSelectionDetail(node);
          this.dispatchEvent(new CustomEvent("onNodeSelected", { detail }));
        }
      }

      this.render();
    }

    /* ---------- Export ---------- */

    /**
     * exportPng(options?)
     *
     * Renders the current visible tree to a PNG image and triggers a
     * browser download. The image includes all visible nodes, connectors,
     * bars, labels, and the background — exactly what the user sees.
     *
     * Options (all optional):
     *   filename:   string (default "decomposition-tree.png")
     *   scale:      number (default 2 — retina quality)
     *   background: string (default uses the widget's backgroundColor)
     */
    exportPng(options) {
      const opts = {
        filename: "decomposition-tree.png",
        scale: 2,
        background: this._settings.backgroundColor,
        ...(options || {})
      };

      const svgEl = this.shadowRoot.querySelector(".dt-main-svg");
      if (!svgEl) return;

      const w = Number(svgEl.getAttribute("width"));
      const h = Number(svgEl.getAttribute("height"));
      if (!w || !h) return;

      // Build a self-contained SVG string with all styles embedded.
      // This avoids cloneNode + getComputedStyle issues in shadow DOM.
      const svgString = this._buildExportSvgString(svgEl, w, h, opts.background);

      // Use base64 data URL (more reliable than blob URL in SAC's webview)
      const base64 = btoa(unescape(encodeURIComponent(svgString)));
      const dataUrl = "data:image/svg+xml;base64," + base64;

      const img = new Image();
      const scale = opts.scale;
      const filename = opts.filename;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        const ctx = canvas.getContext("2d");
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(blob => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
        }, "image/png");
      };

      img.onerror = (e) => {
        console.error("Decomposition Tree: PNG export failed", e);
      };

      img.src = dataUrl;
    }

    // Build a fully self-contained SVG string with embedded <style>,
    // background rect, and the SVG namespace. This is more reliable
    // than cloning DOM nodes because shadow DOM class attributes and
    // computed styles don't always survive cloneNode + serialization.
    _buildExportSvgString(svgEl, w, h, bgColor) {
      const s = this._settings;
      const shadowRgba = hexToRgba(s.nodeShadowColor, 0.18);

      // Get the inner SVG content (connectors + nodes)
      const innerSvg = svgEl.innerHTML;

      // Build the embedded stylesheet — same rules as styles() but
      // with all dynamic values baked in.
      const css = `
        svg { font-family: Arial, Helvetica, sans-serif; }
        .node-card {
          fill: ${s.nodeBackgroundColor};
          stroke: ${s.nodeBorderColor};
          filter: url(#dt-shadow);
        }
        .others-node .node-card { stroke-dasharray: 4 3; }
        .node-label {
          font-size: 12px;
          font-weight: 600;
          fill: ${s.labelColor};
        }
        .others-node .node-label { fill: ${s.othersLabelColor}; }
        .value-label {
          font-size: 11px;
          fill: ${s.valueLabelColor};
        }
        .pct-label {
          font-size: 11px;
          font-weight: 600;
          fill: ${s.labelColor};
          opacity: 0.85;
        }
        .dim-tag {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.03em;
          fill: ${s.valueLabelColor};
          opacity: 0.7;
        }
        .bar-bg { fill: ${s.barBackgroundColor}; }
        .bar-plan { opacity: 0.55; }
        .var-label {
          font-size: 11px;
          font-weight: 700;
        }
        .connector {
          stroke: ${s.connectorColor};
          stroke-width: 1.3;
          fill: none;
        }
        .toggle circle {
          fill: ${s.toggleBackgroundColor};
          stroke: ${s.toggleBorderColor};
        }
        .toggle text {
          font-size: 13px;
          fill: ${s.toggleTextColor};
        }
        .change-dim rect, .change-dim text { opacity: 0; }
        .dt-node.selected .node-card {
          stroke: ${s.focusBorderColor};
          stroke-width: 2.5;
        }
        .dt-node.selected .node-label { fill: ${s.focusBorderColor}; }
        .dt-node.on-path .node-card {
          stroke: ${s.focusBorderColor};
          stroke-width: 1.5;
        }
        .dt-node.dimmed { opacity: 0.42; }
      `;

      return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <style>${css}</style>
    <filter id="dt-shadow" x="-5%" y="-5%" width="115%" height="120%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="${s.nodeShadowColor}" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" fill="${bgColor}"/>
  ${innerSvg}
</svg>`;
    }

    // Legacy method kept for backward compatibility — no longer used
    // by exportPng but may be called by scripting.
    _inlineSvgStyles(clonedSvg) {
      const s = this._settings;

      // Background-level styles
      clonedSvg.style.fontFamily = "Arial, sans-serif";

      // Create an SVG <filter> for the drop shadow (CSS filter doesn't
      // work when the SVG is rendered via Canvas <img>).
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      defs.innerHTML = `
        <filter id="dt-export-shadow" x="-5%" y="-5%" width="115%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5"
            flood-color="${s.nodeShadowColor}" flood-opacity="0.18" />
        </filter>
      `;
      clonedSvg.insertBefore(defs, clonedSvg.firstChild);

      // Node cards
      clonedSvg.querySelectorAll(".node-card").forEach(el => {
        if (!el.getAttribute("fill") && !el.style.fill) {
          el.setAttribute("fill", s.nodeBackgroundColor);
        }
        if (!el.style.stroke) {
          el.setAttribute("stroke", s.nodeBorderColor);
        }
        // Apply SVG filter for shadow (CSS filter won't work in Canvas)
        el.setAttribute("filter", "url(#dt-export-shadow)");
      });

      // Dashed border for Others nodes
      clonedSvg.querySelectorAll(".others-node .node-card").forEach(el => {
        el.setAttribute("stroke-dasharray", "4 3");
      });

      // Node labels
      clonedSvg.querySelectorAll(".node-label").forEach(el => {
        if (!el.getAttribute("fill") || el.getAttribute("fill") === "") {
          el.setAttribute("fill", s.labelColor);
        }
        el.style.fontSize = "12px";
        el.style.fontWeight = el.getAttribute("font-weight") || "600";
        el.style.fontFamily = "Arial, sans-serif";
      });

      // Others node labels
      clonedSvg.querySelectorAll(".others-node .node-label").forEach(el => {
        if (!el.getAttribute("fill") || el.getAttribute("fill") === s.labelColor) {
          el.setAttribute("fill", s.othersLabelColor);
        }
      });

      // Value labels
      clonedSvg.querySelectorAll(".value-label").forEach(el => {
        el.setAttribute("fill", s.valueLabelColor);
        el.style.fontSize = "11px";
        el.style.fontFamily = "Arial, sans-serif";
      });

      // Percent labels
      clonedSvg.querySelectorAll(".pct-label").forEach(el => {
        el.setAttribute("fill", s.labelColor);
        el.style.fontSize = "11px";
        el.style.fontWeight = "600";
        el.style.fontFamily = "Arial, sans-serif";
        el.style.opacity = "0.85";
      });

      // Variance labels (already have inline fill from render)
      clonedSvg.querySelectorAll(".var-label").forEach(el => {
        el.style.fontSize = "11px";
        el.style.fontWeight = "700";
        el.style.fontFamily = "Arial, sans-serif";
      });

      // Dimension tags
      clonedSvg.querySelectorAll(".dim-tag").forEach(el => {
        el.setAttribute("fill", s.valueLabelColor);
        el.style.fontSize = "9px";
        el.style.fontWeight = "600";
        el.style.fontFamily = "Arial, sans-serif";
        el.style.opacity = "0.7";
        el.style.textTransform = "uppercase";
        el.style.letterSpacing = "0.03em";
      });

      // Bar backgrounds
      clonedSvg.querySelectorAll(".bar-bg").forEach(el => {
        el.setAttribute("fill", s.barBackgroundColor);
      });

      // Plan bars (already have inline fill from render)
      clonedSvg.querySelectorAll(".bar-plan").forEach(el => {
        el.style.opacity = "0.55";
      });

      // Connectors
      clonedSvg.querySelectorAll(".connector").forEach(el => {
        el.setAttribute("stroke", s.connectorColor);
        el.setAttribute("stroke-width", "1.3");
        el.setAttribute("fill", "none");
      });

      // Toggle circles
      clonedSvg.querySelectorAll(".toggle circle").forEach(el => {
        el.setAttribute("fill", s.toggleBackgroundColor);
        el.setAttribute("stroke", s.toggleBorderColor);
      });

      // Toggle text
      clonedSvg.querySelectorAll(".toggle text").forEach(el => {
        el.setAttribute("fill", s.toggleTextColor);
        el.style.fontSize = "13px";
        el.style.fontFamily = "Arial, sans-serif";
      });

      // Change-dim button (show it in export even though it's hover-only on screen)
      clonedSvg.querySelectorAll(".change-dim rect").forEach(el => {
        el.style.opacity = "0"; // keep hidden in export
      });
      clonedSvg.querySelectorAll(".change-dim text").forEach(el => {
        el.style.opacity = "0";
      });

      // Selection styles
      clonedSvg.querySelectorAll(".dt-node.selected .node-card").forEach(el => {
        el.setAttribute("stroke", s.focusBorderColor);
        el.setAttribute("stroke-width", "2.5");
      });
      clonedSvg.querySelectorAll(".dt-node.selected .node-label").forEach(el => {
        el.setAttribute("fill", s.focusBorderColor);
      });
      clonedSvg.querySelectorAll(".dt-node.on-path .node-card").forEach(el => {
        el.setAttribute("stroke", s.focusBorderColor);
        el.setAttribute("stroke-width", "1.5");
      });
      clonedSvg.querySelectorAll(".dt-node.dimmed").forEach(el => {
        el.style.opacity = "0.42";
      });
    }

    /**
     * exportCsv(options?)
     *
     * Exports the currently visible tree as a flat CSV file and triggers
     * a browser download. Each row is a visible node with columns:
     *   Level, Label, Dimension, Value, Plan, Variance, Variance%,
     *   % of Parent, % of Total, Rank
     *
     * Options (all optional):
     *   filename:   string (default "decomposition-tree.csv")
     *   separator:  string (default ",")
     *   includeHidden: boolean (default false) — if true, also exports
     *                  non-expanded children by walking the full tree
     */
    exportCsv(options) {
      const opts = {
        filename: "decomposition-tree.csv",
        separator: ",",
        includeHidden: false,
        ...(options || {})
      };

      const sep = opts.separator;
      const rootTree = this._lazyTree ? [this._lazyTree] : this._tree;
      if (!rootTree.length) return;

      const hasPlan = !!(this._dataset && this._dataset.planAlias);

      // Collect rows by walking the tree
      const rows = [];

      const visit = (node, level) => {
        const dimName = this._lazyTree
          ? this._dimensionDisplayForNode(node) : "";
        const pctParent = Number.isFinite(node._pctOfParent)
          ? node._pctOfParent : "";
        const pctTotal = Number.isFinite(node._pctOfTotal)
          ? node._pctOfTotal : "";

        rows.push({
          level,
          label: node.label || "",
          dimension: dimName,
          value: toNumber(node.value),
          plan: hasPlan ? toNumber(node.valuePlan) : "",
          variance: hasPlan && node._variance !== null
            ? toNumber(node._variance) : "",
          variancePct: hasPlan && Number.isFinite(node._variancePct)
            ? node._variancePct : "",
          pctOfParent: pctParent,
          pctOfTotal: pctTotal,
          rank: node._rank || "",
          isOthers: node.isOthers ? "Yes" : ""
        });

        if (node.children) {
          const shouldVisitChildren = opts.includeHidden ||
            this._expanded.has(node.id);
          if (shouldVisitChildren) {
            node.children.forEach(c => visit(c, level + 1));
          }
        }
      };

      rootTree.forEach(r => visit(r, 0));

      // Build CSV
      const headers = [
        "Level", "Label", "Dimension", "Value"
      ];
      if (hasPlan) {
        headers.push("Plan", "Variance", "Variance %");
      }
      headers.push("% of Parent", "% of Total", "Rank", "Is Others");

      const csvEscape = val => {
        const s = String(val ?? "");
        if (s.includes(sep) || s.includes('"') || s.includes("\n")) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      };

      const fmtPct = v =>
        v === "" ? "" : (Number(v) * 100).toFixed(1) + "%";

      const csvLines = [
        headers.map(csvEscape).join(sep),
        ...rows.map(r => {
          const cols = [
            r.level,
            r.label,
            r.dimension,
            r.value
          ];
          if (hasPlan) {
            cols.push(r.plan, r.variance, fmtPct(r.variancePct));
          }
          cols.push(
            fmtPct(r.pctOfParent),
            fmtPct(r.pctOfTotal),
            r.rank,
            r.isOthers
          );
          return cols.map(csvEscape).join(sep);
        })
      ];

      const csvString = csvLines.join("\n");
      const blob = new Blob(["\uFEFF" + csvString], {
        type: "text/csv;charset=utf-8"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = opts.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

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
      const used = this._activeLevelDimensions(level);
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
      const toDelete = new Set();
      const visit = node => {
        if (node.level >= level) toDelete.add(node.id);
        if (node.children) node.children.forEach(visit);
      };
      visit(this._lazyTree);
      for (const id of toDelete) this._expanded.delete(id);
      // If the selected node lived at or below the affected level, its
      // filter context is no longer meaningful — drop it silently.
      if (this._selectedNodeId && toDelete.has(this._selectedNodeId)) {
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
      this._clearLevelInUseCache();

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

      const positioned = visible.map((node, rowIndex) => {
        const off = this._nodeOffsets.get(node.id);
        return {
          ...node,
          x: 20 + node.level * (s.nodeWidth + s.levelGap) + (off ? off.dx : 0),
          y: 20 + rowIndex * (s.nodeHeight + s.siblingGap) + (off ? off.dy : 0),
          _defaultX: 20 + node.level * (s.nodeWidth + s.levelGap),
          _defaultY: 20 + rowIndex * (s.nodeHeight + s.siblingGap),
          width: s.nodeWidth,
          height: s.nodeHeight
        };
      });

      const maxLevel = Math.max(0, ...positioned.map(n => n.level));
      const maxX = Math.max(700, ...positioned.map(n => n.x + n.width + 20));
      const maxY = Math.max(240, ...positioned.map(n => n.y + n.height + 20));
      const width = Math.max(
        700,
        40 + (maxLevel + 1) * (s.nodeWidth + s.levelGap),
        maxX
      );
      const height = Math.max(
        240,
        40 + positioned.length * (s.nodeHeight + s.siblingGap),
        maxY
      );

      // Cache for hover card reuse (avoids recomputing on every mouseenter).
      this._cachedPositioned = positioned;
      this._cachedWidth = width;

      const byIndex = new Map(positioned.map(n => [n.visibleIndex, n]));

      const inLazyMode = !!this._lazyTree;

      // Selection-path set: ids that are either the selected node or
      // direct ancestors of it. Used to keep the path highlighted while
      // siblings off-path get a subtle dim treatment.
      const selectionPathIds = this._computeSelectionPathIds(positioned, byIndex);
      const hasSelection = !!this._selectedNodeId && selectionPathIds.size > 0;

      const hasPlan = !!(this._dataset && this._dataset.planAlias);
      const inComparisonMode = hasPlan && s.showPlanBar !== false;

      const padL = Math.max(0, toNumber(s.paddingLeft) || 14);
      const padR = Math.max(0, toNumber(s.paddingRight) || 14);
      const tagGap = Math.max(0, toNumber(s.labelTagGap) || 8);

      // Pre-compute CF hidden nodes: collect all node IDs that should be
      // hidden (plus their descendants, to avoid orphans). Then re-filter
      // positioned, re-index, and recompute Y positions so connectors
      // and layout remain correct.
      let renderNodes = positioned;
      if (this._cfRules.length) {
        const hiddenIds = new Set();
        for (const n of positioned) {
          if (hiddenIds.has(n.id)) continue; // already hidden by ancestor
          const cf = evaluateConditionalFormatting(n, this._cfRules);
          if (cf && cf.hide) {
            // Hide this node and all its descendants
            hiddenIds.add(n.id);
            const hideDescendants = (nodes, parentIdx) => {
              for (const child of nodes) {
                if (child.parentVisibleIndex === parentIdx) {
                  hiddenIds.add(child.id);
                  hideDescendants(nodes, child.visibleIndex);
                }
              }
            };
            hideDescendants(positioned, n.visibleIndex);
          }
        }
        if (hiddenIds.size) {
          // Rebuild with correct Y positions and parent indices
          const filtered = positioned.filter(n => !hiddenIds.has(n.id));
          const oldToNew = new Map();
          filtered.forEach((n, newIdx) => {
            oldToNew.set(n.visibleIndex, newIdx);
          });
          renderNodes = filtered.map((n, newIdx) => ({
            ...n,
            visibleIndex: newIdx,
            parentVisibleIndex: n.parentVisibleIndex !== null
              ? (oldToNew.get(n.parentVisibleIndex) ?? null)
              : null,
            y: 20 + newIdx * (s.nodeHeight + s.siblingGap)
          }));
        }
      }

      // Rebuild byIndex, connectors, and dimensions after potential CF filtering
      const byIndex2 = new Map(renderNodes.map(n => [n.visibleIndex, n]));
      const connectors2 = renderNodes
        .filter(n => n.parentVisibleIndex !== null && byIndex2.has(n.parentVisibleIndex))
        .map(n => {
          const p = byIndex2.get(n.parentVisibleIndex);
          const x1 = p.x + p.width;
          const y1 = p.y + p.height / 2;
          const x2 = n.x;
          const y2 = n.y + n.height / 2;
          const mid = (x1 + x2) / 2;
          return `<path class="connector" d="M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}" />`;
        })
        .join("");
      const renderHeight = Math.max(240, 40 + renderNodes.length * (s.nodeHeight + s.siblingGap));

      const nodes = renderNodes
        .map(node => {
          const barX = node.x + padL;
          const barY = node.y + 31;
          const barWidthMax = Math.max(0, node.width - padL - padR);

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
          // level). In static mode we use the pre-computed flag from
          // computeVisibleNodes.
          let hasChildren;
          if (inLazyMode) {
            hasChildren = !node.isOthers &&
              !!this._dimensionForLevel(node.level + 1);
          } else {
            hasChildren = !!node._hasChildren;
          }

          const expanded = this._expanded.has(node.id);
          let fill = this.getNodeColor(node);
          const displayLabel = this.getNodeDisplayLabel(node);

          // Conditional formatting: evaluate rules for this node.
          // (Hide action already handled in pre-filter above.)
          const cf = evaluateConditionalFormatting(node, this._cfRules);
          const cfBarColor       = cf && cf.barColor       ? cf.barColor       : null;
          const cfLabelBold      = cf && cf.labelBold      ? true              : false;
          const cfLabelColor     = cf && cf.labelColor     ? cf.labelColor     : null;
          const cfCardBorder     = cf && cf.cardBorder     ? cf.cardBorder     : null;
          const cfCardBackground = cf && cf.cardBackground ? cf.cardBackground : null;
          if (cfBarColor) fill = cfBarColor;

          // "Change dimension" affordance: small icon, only in lazy mode,
          // only on nodes whose child level has more than one alternative.
          const showChangeIcon =
            inLazyMode &&
            !node.isOthers &&
            this._availableDimsForLevel(node.level + 1).length > 1;

          const dimLabel = inLazyMode ? this._dimensionDisplayForNode(node) : "";
          const showDimTag = s.showDimensionTag !== false && !!dimLabel;

          // Reserve space for the dim tag so the node label doesn't overlap.
          // SVG text width is hard to know without a DOM measure pass; we
          // estimate ~6.5px per char at 9px font size and cap at half-card.
          const dimTagEstWidth = showDimTag
            ? Math.min(node.width / 2, Math.max(20, dimLabel.length * 6.5))
            : 0;
          const togglePad = hasChildren ? 16 : 0;
          const labelStartX = node.x + padL + togglePad;
          const labelMaxRight = node.x + node.width - padR -
            (showDimTag ? dimTagEstWidth + tagGap : 0);
          const labelMaxWidth = Math.max(20, labelMaxRight - labelStartX);
          // Unique clip id per node so each label clips to its own width.
          const labelClipId = `dt-clip-${node.visibleIndex}`;

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
                ${cfCardBorder ? `style="stroke:${cfCardBorder};stroke-width:2"` : ""}
                ${cfCardBackground ? `fill="${cfCardBackground}"` : ""}
              ></rect>

              ${
                hasChildren
                  ? `
                    <g class="toggle" data-action="toggle" data-node-id="${escapeXml(node.id)}">
                      <circle cx="${node.x + padL}" cy="${node.y + 19}" r="9"></circle>
                      <text x="${node.x + padL}" y="${node.y + 23}" text-anchor="middle">${expanded ? "−" : "+"}</text>
                    </g>
                  `
                  : ""
              }

              <defs>
                <clipPath id="${labelClipId}">
                  <rect x="${labelStartX}" y="${node.y}" width="${labelMaxWidth}" height="${node.height}"></rect>
                </clipPath>
              </defs>
              <text class="node-label" clip-path="url(#${labelClipId})" x="${labelStartX}" y="${node.y + 23}" ${cfLabelColor ? `fill="${cfLabelColor}"` : ""} ${cfLabelBold ? `font-weight="900"` : ""}>${escapeXml(displayLabel)}</text>

              ${
                showDimTag
                  ? `<text class="dim-tag" x="${node.x + node.width - padR}" y="${node.y + 14}" text-anchor="end">${escapeXml(dimLabel)}</text>`
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
                  ? `<text class="var-label" x="${node.x + node.width - padR}" y="${node.y + 52}" text-anchor="end" fill="${varianceColor}">${escapeXml(this._formatVarianceShort(variance, variancePct))}</text>`
                  : (s.showPercentOfParent !== false &&
                     node.level > 0 &&
                     Number.isFinite(node._pctOfParent)
                      ? `<text class="pct-label" x="${node.x + node.width - padR}" y="${node.y + 52}" text-anchor="end">${escapeXml(formatPercent(node._pctOfParent, s.percentDecimals))}</text>`
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
      const pickerHtml = this._renderPickerHtml(renderNodes);
      const hoverHtml = this._renderHoverCardHtml(renderNodes, width);
      const bannerHtml = this._renderSelectionBannerHtml();

      const showPngBtn = s.showExportPng !== false;
      const showCsvBtn = s.showExportCsv !== false;
      const showExportBar = showPngBtn || showCsvBtn;
      const showDrag = s.enableNodeDrag !== false;
      const showZoom = s.enableZoomPan !== false;
      const hasOffsets = this._nodeOffsets.size > 0;
      const isZoomed = this._zoom !== 1 || this._panX !== 0 || this._panY !== 0;
      const showReset = hasOffsets || isZoomed;

      const exportBarHtml = showExportBar || showReset || showZoom ? `
            <div class="export-toolbar" aria-label="Toolbar">
              ${showZoom ? `
                <button type="button" class="export-btn" data-action="zoom-in" title="Zoom in">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M5 7h4M7 5v4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                </button>
                <span class="zoom-label">${Math.round(this._zoom * 100)}%</span>
                <button type="button" class="export-btn" data-action="zoom-out" title="Zoom out">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M5 7h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                </button>
                <button type="button" class="export-btn" data-action="zoom-fit" title="Fit to view">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M2 6h4V2M10 2v4h4M14 10h-4v4M6 14v-4H2" stroke="currentColor" stroke-width="1.1"/></svg>
                </button>
              ` : ""}
              ${showReset ? `
                <button type="button" class="export-btn" data-action="reset-layout" title="Reset positions & zoom">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 8a6 6 0 0111.3-2.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M14 8a6 6 0 01-11.3 2.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M13 2v3.2h-3.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span>Reset</span>
                </button>
              ` : ""}
              ${showPngBtn ? `<button type="button" class="export-btn" data-action="export-png" title="Export as PNG image">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 11l4-5 3 3.5 2-2 3 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.3"/></svg>
                <span>PNG</span>
              </button>` : ""}
              ${showCsvBtn ? `<button type="button" class="export-btn" data-action="export-csv" title="Export as CSV data">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 1h8l3 3v11H1V1z" stroke="currentColor" stroke-width="1.3"/><path d="M4 8h8M4 11h5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                <span>CSV</span>
              </button>` : ""}
            </div>` : "";

      // Zoom/pan: wrap all SVG content in a <g> with transform
      const zoomTransform = showZoom
        ? `translate(${this._panX},${this._panY}) scale(${this._zoom})`
        : "";
      const svgCursor = showZoom ? (this._panState ? "grabbing" : "grab") : "default";

      this.shadowRoot.innerHTML =
        this.styles() +
        `
          <div class="viewport" style="cursor:${showDrag ? "default" : "auto"}">
            ${bannerHtml}
            ${exportBarHtml}
            <svg class="dt-main-svg" width="${width}" height="${renderHeight}" viewBox="0 0 ${width} ${renderHeight}" role="img" aria-label="Decomposition tree" style="cursor:${svgCursor}">
              <g class="dt-zoom-group" ${zoomTransform ? `transform="${zoomTransform}"` : ""}>
                ${connectors2}
                ${nodes}
              </g>
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
      // SVG width, flip to the left. The hover card is absolutely positioned
      // inside .viewport, so we must account for any elements above the SVG
      // (e.g. the selection banner). The SVG element's offsetTop gives us
      // the real vertical offset within the viewport container.
      const cardW = 240;
      const gap = 10;
      let left = target.x + target.width + gap;
      let arrowSide = "left";
      if (left + cardW > viewportWidth) {
        left = target.x - cardW - gap;
        arrowSide = "right";
      }
      // Estimate banner offset: if there's a selection, the banner is ~36px
      const bannerOffset = this._selectedNodeId ? 36 : 0;
      const top = target.y + bannerOffset;

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
        const zoomInEl = event.target.closest("[data-action='zoom-in']");
        if (zoomInEl) { event.preventDefault(); event.stopPropagation(); this._zoomBy(0.15); return; }

        const zoomOutEl = event.target.closest("[data-action='zoom-out']");
        if (zoomOutEl) { event.preventDefault(); event.stopPropagation(); this._zoomBy(-0.15); return; }

        const zoomFitEl = event.target.closest("[data-action='zoom-fit']");
        if (zoomFitEl) { event.preventDefault(); event.stopPropagation(); this._zoomFit(); return; }

        const resetEl = event.target.closest("[data-action='reset-layout']");
        if (resetEl) { event.preventDefault(); event.stopPropagation(); this.resetLayout(); return; }

        const exportPngEl = event.target.closest("[data-action='export-png']");
        if (exportPngEl) {
          event.preventDefault();
          event.stopPropagation();
          this.exportPng();
          return;
        }

        const exportCsvEl = event.target.closest("[data-action='export-csv']");
        if (exportCsvEl) {
          event.preventDefault();
          event.stopPropagation();
          this.exportCsv();
          return;
        }

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
            if (hasChildren && nodeId) {
              this.toggleNode(nodeId);
            } else if (nodeId) {
              // Leaf node: select it (same as mouse click)
              this.selectNode(nodeId);
            }
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

      // ----- Node drag -----
      if (this._settings.enableNodeDrag !== false) {
        this._wireDragEvents();
      }

      // ----- Zoom/pan via mouse wheel and middle-click drag -----
      if (this._settings.enableZoomPan !== false) {
        this._wireZoomPanEvents();
      }
    }

    _wireDragEvents() {
      const svg = this.shadowRoot.querySelector(".dt-main-svg");
      if (!svg) return;

      // Use pointer events for unified mouse+touch handling
      svg.addEventListener("pointerdown", e => {
        // Only left button
        if (e.button !== 0) return;

        const nodeEl = e.target.closest(".dt-node");
        if (!nodeEl) return;

        // Don't drag if clicking on toggle or change-dim buttons
        if (e.target.closest("[data-action='toggle']") ||
            e.target.closest("[data-action='change-dim']")) return;

        const nodeId = nodeEl.getAttribute("data-node-id");
        if (!nodeId) return;

        const off = this._nodeOffsets.get(nodeId) || { dx: 0, dy: 0 };
        // Convert screen coords to SVG coords accounting for zoom
        const pt = this._screenToSvg(e.clientX, e.clientY);

        this._dragState = {
          nodeId,
          startSvgX: pt.x,
          startSvgY: pt.y,
          startDx: off.dx,
          startDy: off.dy,
          moved: false
        };

        nodeEl.style.cursor = "grabbing";
        svg.setPointerCapture(e.pointerId);
        e.preventDefault();
      });

      svg.addEventListener("pointermove", e => {
        if (!this._dragState) return;

        const pt = this._screenToSvg(e.clientX, e.clientY);
        const dx = this._dragState.startDx + (pt.x - this._dragState.startSvgX);
        const dy = this._dragState.startDy + (pt.y - this._dragState.startSvgY);

        // Only start dragging after a small threshold to avoid accidental drags
        if (!this._dragState.moved) {
          const dist = Math.abs(pt.x - this._dragState.startSvgX) +
                       Math.abs(pt.y - this._dragState.startSvgY);
          if (dist < 4) return;
          this._dragState.moved = true;
        }

        this._nodeOffsets.set(this._dragState.nodeId, { dx, dy });
        this._updateDraggedNode(this._dragState.nodeId, dx, dy);
      });

      svg.addEventListener("pointerup", e => {
        if (!this._dragState) return;
        const wasDrag = this._dragState.moved;
        this._dragState = null;
        svg.releasePointerCapture(e.pointerId);

        if (wasDrag) {
          // Full re-render to update connectors and cache
          this.render();
        }
      });
    }

    // Convert screen coordinates to SVG coordinate space (accounting for zoom/pan)
    _screenToSvg(clientX, clientY) {
      const svg = this.shadowRoot.querySelector(".dt-main-svg");
      if (!svg) return { x: clientX, y: clientY };

      const rect = svg.getBoundingClientRect();
      const viewBox = svg.viewBox.baseVal;
      const scaleX = viewBox.width / rect.width;
      const scaleY = viewBox.height / rect.height;

      // Screen → SVG viewBox coords
      let x = (clientX - rect.left) * scaleX;
      let y = (clientY - rect.top) * scaleY;

      // Undo the zoom/pan transform
      x = (x - this._panX) / this._zoom;
      y = (y - this._panY) / this._zoom;

      return { x, y };
    }

    // Live-update a single dragged node without full re-render
    _updateDraggedNode(nodeId, dx, dy) {
      const nodeEl = this.shadowRoot.querySelector(
        `.dt-node[data-node-id="${nodeId.replace(/"/g, '\\"')}"]`
      );
      if (!nodeEl) return;

      // Find the node's default position from cache
      const cached = this._cachedPositioned;
      if (!cached) return;
      const nodeData = cached.find(n => n.id === nodeId);
      if (!nodeData) return;

      const newX = nodeData._defaultX + dx;
      const newY = nodeData._defaultY + dy;
      const s = this._settings;
      const padL = Math.max(0, toNumber(s.paddingLeft) || 14);

      // Move the entire <g> via transform
      nodeEl.setAttribute("transform", `translate(${dx},${dy})`);

      // Update connectors that touch this node (parent→this, this→children)
      this._updateConnectors(nodeId, newX, newY);
    }

    // Redraw connectors touching a specific node during drag
    _updateConnectors(nodeId, newX, newY) {
      const cached = this._cachedPositioned;
      if (!cached) return;
      const nodeData = cached.find(n => n.id === nodeId);
      if (!nodeData) return;

      const svg = this.shadowRoot.querySelector(".dt-zoom-group");
      if (!svg) return;

      // Rebuild all connectors (simple approach — works because connector
      // count is small relative to drag frame rate)
      const byIndex = new Map(cached.map(n => [n.visibleIndex, n]));

      // Recompute positions with current offsets
      const getPos = (n) => {
        const off = this._nodeOffsets.get(n.id) || { dx: 0, dy: 0 };
        return {
          x: n._defaultX + off.dx,
          y: n._defaultY + off.dy,
          w: n.width,
          h: n.height
        };
      };

      const connectors = svg.querySelectorAll("path.connector");
      let connIdx = 0;

      for (const n of cached) {
        if (n.parentVisibleIndex === null || !byIndex.has(n.parentVisibleIndex)) continue;
        const p = byIndex.get(n.parentVisibleIndex);
        const pPos = getPos(p);
        const nPos = getPos(n);

        const x1 = pPos.x + pPos.w;
        const y1 = pPos.y + pPos.h / 2;
        const x2 = nPos.x;
        const y2 = nPos.y + nPos.h / 2;
        const mid = (x1 + x2) / 2;

        if (connectors[connIdx]) {
          connectors[connIdx].setAttribute("d",
            `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`
          );
        }
        connIdx++;
      }
    }

    _wireZoomPanEvents() {
      const svg = this.shadowRoot.querySelector(".dt-main-svg");
      if (!svg) return;

      // Wheel zoom: zoom toward cursor position
      svg.addEventListener("wheel", e => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.08 : 0.08;
        this._zoomBy(delta, e.clientX, e.clientY);
      }, { passive: false });

      // Middle-click or Ctrl+left-click pan
      svg.addEventListener("pointerdown", e => {
        if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
          e.preventDefault();
          this._panState = {
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            startPanX: this._panX,
            startPanY: this._panY
          };
          svg.setPointerCapture(e.pointerId);
          svg.style.cursor = "grabbing";
        }
      });

      svg.addEventListener("pointermove", e => {
        if (!this._panState) return;

        const rect = svg.getBoundingClientRect();
        const viewBox = svg.viewBox.baseVal;
        const scaleX = viewBox.width / rect.width;
        const scaleY = viewBox.height / rect.height;

        this._panX = this._panState.startPanX +
          (e.clientX - this._panState.startMouseX) * scaleX;
        this._panY = this._panState.startPanY +
          (e.clientY - this._panState.startMouseY) * scaleY;

        const group = svg.querySelector(".dt-zoom-group");
        if (group) {
          group.setAttribute("transform",
            `translate(${this._panX},${this._panY}) scale(${this._zoom})`
          );
        }
      });

      svg.addEventListener("pointerup", e => {
        if (!this._panState) return;
        this._panState = null;
        svg.releasePointerCapture(e.pointerId);
        svg.style.cursor = "grab";
      });
    }

    _zoomBy(delta, clientX, clientY) {
      const oldZoom = this._zoom;
      this._zoom = Math.max(0.2, Math.min(3, this._zoom + delta));

      // If cursor position is provided, zoom toward it
      if (clientX !== undefined && clientY !== undefined) {
        const svg = this.shadowRoot.querySelector(".dt-main-svg");
        if (svg) {
          const rect = svg.getBoundingClientRect();
          const viewBox = svg.viewBox.baseVal;
          const scaleX = viewBox.width / rect.width;
          const scaleY = viewBox.height / rect.height;

          // Cursor position in SVG viewBox coords
          const cx = (clientX - rect.left) * scaleX;
          const cy = (clientY - rect.top) * scaleY;

          // Adjust pan so the point under the cursor stays fixed
          this._panX = cx - (cx - this._panX) * (this._zoom / oldZoom);
          this._panY = cy - (cy - this._panY) * (this._zoom / oldZoom);
        }
      }

      // Live-update the transform without full re-render
      const group = this.shadowRoot.querySelector(".dt-zoom-group");
      if (group) {
        group.setAttribute("transform",
          `translate(${this._panX},${this._panY}) scale(${this._zoom})`
        );
      }

      // Update the zoom label
      const label = this.shadowRoot.querySelector(".zoom-label");
      if (label) label.textContent = Math.round(this._zoom * 100) + "%";

      // Show/hide reset button via re-render (debounced)
      if (this._zoomRenderTimer) clearTimeout(this._zoomRenderTimer);
      this._zoomRenderTimer = setTimeout(() => {
        this._zoomRenderTimer = null;
        // Only re-render if reset button visibility changed
        const showReset = this._nodeOffsets.size > 0 ||
          this._zoom !== 1 || this._panX !== 0 || this._panY !== 0;
        const resetBtn = this.shadowRoot.querySelector("[data-action='reset-layout']");
        if (showReset && !resetBtn) this.render();
      }, 300);
    }

    _zoomFit() {
      const viewport = this.shadowRoot.querySelector(".viewport");
      const svg = this.shadowRoot.querySelector(".dt-main-svg");
      if (!viewport || !svg) return;

      const vw = viewport.clientWidth;
      const vh = viewport.clientHeight;
      const viewBox = svg.viewBox.baseVal;
      if (!viewBox.width || !viewBox.height) return;

      const scaleX = vw / viewBox.width;
      const scaleY = vh / viewBox.height;
      this._zoom = Math.max(0.2, Math.min(2, Math.min(scaleX, scaleY) * 0.92));
      this._panX = 0;
      this._panY = 0;

      this.render();
    }

    resetLayout() {
      this._nodeOffsets.clear();
      this._zoom = 1;
      this._panX = 0;
      this._panY = 0;
      this.render();
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

      // Use cached positioned array from last render() instead of
      // recomputing the full tree walk + positioning on every hover.
      const positioned = this._cachedPositioned;
      const width = this._cachedWidth;
      if (!positioned || !positioned.length) return;

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

          /* Export toolbar */
          .export-toolbar {
            position: sticky;
            top: ${this._selectedNodeId ? "36px" : "0"};
            right: 0;
            z-index: 7;
            display: flex;
            gap: 2px;
            justify-content: flex-end;
            padding: 6px 8px 2px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 180ms ease;
          }
          .viewport:hover .export-toolbar { opacity: 1; }
          .export-btn {
            pointer-events: all;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            border: 1px solid ${s.nodeBorderColor};
            border-radius: 5px;
            background: ${s.nodeBackgroundColor};
            color: ${s.valueLabelColor};
            font: inherit;
            font-size: 10px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 1px 3px ${hexToRgba(s.nodeShadowColor, 0.12)};
            transition: background 120ms ease, color 120ms ease;
          }
          .export-btn:hover {
            background: ${s.backgroundColor};
            color: ${s.labelColor};
          }
          .export-btn svg { flex: 0 0 auto; }
          .zoom-label {
            font-size: 10px;
            font-weight: 600;
            color: ${s.valueLabelColor};
            min-width: 30px;
            text-align: center;
            pointer-events: all;
            user-select: none;
          }
          .dt-node { cursor: ${s.enableNodeDrag !== false ? "grab" : "pointer"}; outline: none; pointer-events: all; }
          .dt-node:active { cursor: ${s.enableNodeDrag !== false ? "grabbing" : "pointer"}; }
        </style>
      `;
    }
  }

  /* ---------- Styling panel (Builder Panel) ----------
     Renders form controls bound to manifest properties. Each control,
     on change, fires a 'propertiesChanged' CustomEvent which SAC routes
     back into the main widget's onCustomWidgetBeforeUpdate hook. */

  const STYLING_FIELDS = [
    { section: "Theme & Density" },
    { prop: "themePreset",             label: "Color theme",              type: "select", options: [
      { value: "custom",         label: "Custom (manual)" },
      { value: "light",          label: "Light" },
      { value: "dark",           label: "Dark" },
      { value: "horizon",        label: "SAP Horizon" },
      { value: "highContrast",   label: "High Contrast" },
      { value: "printFriendly",  label: "Print-friendly" }
    ]},
    { prop: "densityMode",             label: "Density",                  type: "select", options: [
      { value: "compact",     label: "Compact" },
      { value: "comfortable", label: "Comfortable" },
      { value: "spacious",    label: "Spacious" }
    ]},

    { section: "Layout" },
    { prop: "nodeWidth",             label: "Node width (px)",          type: "number",  min: 80,  max: 600 },
    { prop: "nodeHeight",            label: "Node height (px)",         type: "number",  min: 30,  max: 200 },
    { prop: "levelGap",              label: "Gap between levels (px)",  type: "number",  min: 0,   max: 400 },
    { prop: "siblingGap",            label: "Gap between siblings (px)",type: "number",  min: 0,   max: 200 },
    { prop: "paddingLeft",           label: "Card left padding (px)",   type: "number",  min: 0,   max: 80 },
    { prop: "paddingRight",          label: "Card right padding (px)",  type: "number",  min: 0,   max: 80 },
    { prop: "labelTagGap",           label: "Gap: label ↔ dim tag (px)",type: "number",  min: 0,   max: 80 },
    { prop: "showDimensionTag",      label: "Show dimension tag",       type: "boolean" },

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
    { prop: "sortDescending",        label: "Sort descending by value", type: "boolean" },

    { section: "Export" },
    { prop: "showExportPng",         label: "Show PNG download button", type: "boolean" },
    { prop: "showExportCsv",         label: "Show CSV download button", type: "boolean" },

    { section: "Interaction" },
    { prop: "enableNodeDrag",        label: "Allow dragging nodes",     type: "boolean" },
    { prop: "enableZoomPan",         label: "Enable zoom & pan",        type: "boolean" }
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

      // When a theme preset is chosen, apply its palette values and push
      // them all at once so the main widget updates immediately.
      if (prop === "themePreset" && value !== "custom") {
        const preset = THEME_PRESETS[value];
        if (preset && preset.values) {
          const merged = { [prop]: value, ...preset.values };
          Object.assign(this._props, preset.values);
          this.dispatchEvent(
            new CustomEvent("propertiesChanged", {
              detail: { properties: merged }
            })
          );
          this.syncControls();
          return;
        }
      }

      // When a density mode is chosen, push its layout values.
      if (prop === "densityMode") {
        const density = DENSITY_MODES[value];
        if (density && density.values) {
          const merged = { [prop]: value, ...density.values };
          Object.assign(this._props, density.values);
          this.dispatchEvent(
            new CustomEvent("propertiesChanged", {
              detail: { properties: merged }
            })
          );
          this.syncControls();
          return;
        }
      }

      // Any manual color tweak switches theme to "custom"
      const isColorProp = STYLING_FIELDS.some(f =>
        f.prop === prop && f.type === "color"
      );
      if (isColorProp && this._props.themePreset !== "custom") {
        this._props.themePreset = "custom";
        this.dispatchEvent(
          new CustomEvent("propertiesChanged", {
            detail: { properties: { [prop]: value, themePreset: "custom" } }
          })
        );
        this.syncControls();
        return;
      }

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

          /* Conditional formatting rule editor */
          .cf-section {
            margin-top: 12px;
            border-top: 1px solid #e5e9ef;
            padding-top: 8px;
          }
          .cf-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .cf-title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: #556b82;
          }
          .cf-add-btn {
            padding: 3px 10px;
            font-size: 11px;
            font-weight: 600;
            border: 1px solid #0a6ed1;
            border-radius: 4px;
            background: transparent;
            color: #0a6ed1;
            cursor: pointer;
          }
          .cf-add-btn:hover { background: #eef4fb; }
          .cf-rule {
            border: 1px solid #e5e9ef;
            border-radius: 6px;
            padding: 8px;
            margin-bottom: 8px;
            background: #fafbfc;
          }
          .cf-rule-row {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 6px;
            flex-wrap: wrap;
          }
          .cf-rule-row:last-child { margin-bottom: 0; }
          .cf-rule select, .cf-rule input[type="number"] {
            padding: 3px 5px;
            border: 1px solid #bfc8d4;
            border-radius: 4px;
            font: inherit;
            font-size: 11px;
            color: inherit;
            background: #fff;
            box-sizing: border-box;
          }
          .cf-rule select { min-width: 80px; }
          .cf-rule input[type="number"] { width: 70px; }
          .cf-rule input[type="color"] {
            width: 30px;
            height: 22px;
            padding: 0;
            border: 1px solid #bfc8d4;
            border-radius: 3px;
            cursor: pointer;
          }
          .cf-rule-label {
            font-size: 10px;
            color: #556b82;
            font-weight: 600;
            min-width: 30px;
          }
          .cf-remove-btn {
            margin-left: auto;
            padding: 2px 8px;
            font-size: 10px;
            border: 1px solid #dc2626;
            border-radius: 3px;
            background: transparent;
            color: #dc2626;
            cursor: pointer;
          }
          .cf-remove-btn:hover { background: #fef2f2; }
          .cf-empty {
            font-size: 11px;
            color: #94a3b8;
            font-style: italic;
            padding: 4px 0;
          }
        </style>
        ${rowsHtml}
        ${this._renderCfEditor()}
      `;

      this._rendered = true;
      this.wireEvents();
    }

    _getCfRules() {
      try {
        const raw = this._props.conditionalFormattingRules;
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }

    _setCfRules(rules) {
      const json = JSON.stringify(rules);
      this.emitChange("conditionalFormattingRules", json);
    }

    _renderCfEditor() {
      const rules = this._getCfRules();

      const fieldOptions = CF_FIELDS
        .map(f => `<option value="${f.value}">${escapeXml(f.label)}</option>`)
        .join("");
      const opOptions = CF_OPERATORS
        .map(o => `<option value="${o.value}">${escapeXml(o.label)}</option>`)
        .join("");
      const actionOptions = CF_ACTIONS
        .map(a => `<option value="${a.value}">${escapeXml(a.label)}</option>`)
        .join("");

      const rulesHtml = rules.length
        ? rules.map((rule, idx) => {
            const actionDef = CF_ACTIONS.find(a => a.value === rule.action) || CF_ACTIONS[0];
            const showColorInput = actionDef.type === "color";
            return `
              <div class="cf-rule" data-cf-idx="${idx}">
                <div class="cf-rule-row">
                  <span class="cf-rule-label">If</span>
                  <select data-cf-field="field" data-cf-idx="${idx}">
                    ${CF_FIELDS.map(f =>
                      `<option value="${f.value}" ${rule.field === f.value ? "selected" : ""}>${escapeXml(f.label)}</option>`
                    ).join("")}
                  </select>
                  <select data-cf-field="operator" data-cf-idx="${idx}">
                    ${CF_OPERATORS.map(o =>
                      `<option value="${o.value}" ${rule.operator === o.value ? "selected" : ""}>${escapeXml(o.label)}</option>`
                    ).join("")}
                  </select>
                  <input type="number" step="any" data-cf-field="value" data-cf-idx="${idx}" value="${rule.value ?? 0}" />
                </div>
                <div class="cf-rule-row">
                  <span class="cf-rule-label">Then</span>
                  <select data-cf-field="action" data-cf-idx="${idx}">
                    ${CF_ACTIONS.map(a =>
                      `<option value="${a.value}" ${rule.action === a.value ? "selected" : ""}>${escapeXml(a.label)}</option>`
                    ).join("")}
                  </select>
                  ${showColorInput
                    ? `<input type="color" data-cf-field="actionValue" data-cf-idx="${idx}" value="${rule.actionValue || "#dc2626"}" />`
                    : ""
                  }
                  <button type="button" class="cf-remove-btn" data-cf-remove="${idx}">✕</button>
                </div>
              </div>
            `;
          }).join("")
        : `<div class="cf-empty">No rules defined. Click + Add rule.</div>`;

      return `
        <div class="cf-section">
          <div class="cf-header">
            <span class="cf-title">Conditional Formatting</span>
            <button type="button" class="cf-add-btn" data-cf-add>+ Add rule</button>
          </div>
          ${rulesHtml}
        </div>
      `;
    }

    _wireCfEvents() {
      // Add rule
      const addBtn = this.shadowRoot.querySelector("[data-cf-add]");
      if (addBtn) {
        addBtn.addEventListener("click", () => {
          const rules = this._getCfRules();
          rules.push({
            field: "variancePct",
            operator: "<",
            value: -0.1,
            action: "barColor",
            actionValue: "#dc2626"
          });
          this._setCfRules(rules);
          // Re-render the panel to show the new rule
          this.render();
        });
      }

      // Remove rule
      this.shadowRoot.querySelectorAll("[data-cf-remove]").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.getAttribute("data-cf-remove"));
          const rules = this._getCfRules();
          rules.splice(idx, 1);
          this._setCfRules(rules);
          this.render();
        });
      });

      // Rule field changes
      this.shadowRoot.querySelectorAll("[data-cf-field]").forEach(el => {
        const changeEvent = el.type === "color" ? "input" : "change";
        el.addEventListener(changeEvent, () => {
          const idx = Number(el.getAttribute("data-cf-idx"));
          const field = el.getAttribute("data-cf-field");
          const rules = this._getCfRules();
          if (!rules[idx]) return;

          let val = el.value;
          if (field === "value") {
            val = Number(val);
            if (!Number.isFinite(val)) val = 0;
          }
          rules[idx][field] = val;

          // When action type changes, reset actionValue appropriately
          if (field === "action") {
            const actionDef = CF_ACTIONS.find(a => a.value === val);
            if (actionDef && actionDef.type === "color") {
              rules[idx].actionValue = rules[idx].actionValue || "#dc2626";
            } else {
              rules[idx].actionValue = true;
            }
            this._setCfRules(rules);
            this.render(); // Re-render to show/hide color input
            return;
          }

          this._setCfRules(rules);
        });
      });
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

      // Wire CF rule editor events
      this._wireCfEvents();
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
