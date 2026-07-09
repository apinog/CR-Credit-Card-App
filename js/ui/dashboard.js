/**
 * ui/dashboard.js — Phase 2: live FX pill, CRC/USD toggle, real projections.
 */
window.CRW = window.CRW || {};
CRW.ui = CRW.ui || {};

CRW.ui.dashboard = (() => {
  const { el, fmtUSD, fmtCRC, esc, fxPill } = CRW.utils;

  function miniCardEl(card) {
    const d = el("div", { class: "mini-card" });
    d.style.background = `linear-gradient(135deg, ${card.art.from}, ${card.art.to})`;
    return d;
  }

  function render(root) {
    root.innerHTML = "";
    const E = CRW.engine;
    const cards = E.activeCards();
    const monthly = CRW.state.get("monthlySpendUSD");
    const mode = CRW.state.get("displayMode") || "USD";
    const proj = E.yearlyProjection(monthly);
    const bestRewards = proj[0];
    const bestAcc = E.bestAcceptanceCard();
    const recents = CRW.state.get("recentCalcs");

    const bestVal = mode === "CRC"
      ? fmtCRC(bestRewards?.valueCRC || 0)
      : fmtUSD(bestRewards?.valueUSD || 0, 0);

    // Currency toggle for dashboard
    const toggleWrap = el("div", { class: "currency-toggle", style: "margin-bottom:4px" });
    const usdBtn = el("button", { class: "toggle-btn" + (mode === "USD" ? " active" : ""), onclick: () => switchMode("USD") }, "$ USD");
    const crcBtn = el("button", { class: "toggle-btn" + (mode === "CRC" ? " active" : ""), onclick: () => switchMode("CRC") }, "₡ CRC");
    toggleWrap.append(usdBtn, crcBtn);

    function switchMode(m) {
      CRW.state.set("displayMode", m);
      CRW.router.go("dashboard");
    }

    root.append(
      el("div", { class: "view-head" },
        el("div", { class: "eyebrow" }, "Dashboard"),
        el("h1", {}, "Your wallet at a glance"),
        el("div", { class: "dash-head-row" },
          el("p", { class: "sub" }, `${cards.length} active cards`),
          toggleWrap
        )
      ),

      // Stat tiles
      el("div", { class: "stat-tiles" },
        el("div", { class: "tile hero" },
          el("div", { class: "t-label" }, "Est. yearly rewards"),
          el("div", { class: "t-value" }, bestVal),
          el("div", { class: "t-sub" },
            `if ${fmtUSD(monthly, 0)}/mo went on ${bestRewards?.card.name || "—"} at base rate`)
        ),
        el("div", { class: "tile" },
          el("div", { class: "t-label" }, "Cards owned"),
          el("div", { class: "t-value" }, String(cards.length)),
          el("div", { class: "t-sub" }, cards.map((c) => c.network).join(" · "))
        ),
        el("div", { class: "tile" },
          el("div", { class: "t-label" }, "Best acceptance"),
          el("div", { class: "t-value", style: "font-size:1rem;font-family:var(--font-body)" }, bestAcc?.card.name || "—"),
          el("div", { class: "t-sub" }, `~${bestAcc?.acc.pct}% nationwide (est.)`)
        )
      ),

      // Quick recommendation
      el("div", { class: "panel", style: "margin-top:20px" },
        el("h2", {}, "Quick recommendation"),
        el("div", { class: "reco-row" },
          bestRewards ? miniCardEl(bestRewards.card) : null,
          el("div", { class: "body" },
            el("div", { class: "title" }, "Best for rewards"),
            el("div", { class: "desc" }, `${esc(bestRewards?.card.name || "—")} — highest projected value on your spend`)
          ),
          el("div", { class: "val" },
            mode === "CRC"
              ? fmtCRC(bestRewards?.valueCRC || 0) + "/yr"
              : fmtUSD(bestRewards?.valueUSD || 0, 0) + "/yr")
        ),
        el("div", { class: "reco-row" },
          bestAcc ? miniCardEl(bestAcc.card) : null,
          el("div", { class: "body" },
            el("div", { class: "title" }, "Best for acceptance"),
            el("div", { class: "desc" }, `${esc(bestAcc?.card.name || "—")} — safest when Amex is uncertain`)
          ),
          el("div", { class: "val" }, `~${bestAcc?.acc.pct}%`)
        ),
        el("div", { style: "margin-top:14px" },
          el("button", { class: "btn", onclick: () => CRW.router.go("optimizer") }, "Optimize a purchase →")
        )
      ),

      // Recent calculations
      el("div", { class: "panel" },
        el("h2", {}, "Recent calculations"),
        recents.length === 0
          ? el("div", { class: "empty" }, "No calculations yet. Run the optimizer and your history will appear here.")
          : el("div", {}, recents.map((r) =>
              el("div", { class: "reco-row" },
                el("div", { class: "body" },
                  el("div", { class: "title" }, `${esc(r.categoryLabel)} · ${esc(r.amountLabel)}`),
                  el("div", { class: "desc" }, `Best: ${esc(r.bestCardName)}${r.provinceName ? " · " + esc(r.provinceName) : ""}`)
                ),
                el("div", { class: "val" }, esc(r.rewardDisplay))
              )
            ))
      ),

      // FX pill at bottom
      el("div", { class: "fx-row", style: "margin-top:16px" }, fxPill()),

      el("p", { class: "faint", style: "margin-top:8px" },
        "Acceptance figures are personal estimates, not official statistics.")
    );
  }

  return { render };
})();
