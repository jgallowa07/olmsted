import React from "react";
import { infoPanelStyles } from "../../../globalStyles";
import { prettyString } from "../../../util/stringHelpers";
import { numericToCalendar } from "../../../util/dateHelpers";
import { getTipColorAttribute } from "../../../util/colorHelpers";

const infoLineJSX = (item, value) => (
  <span>
    <span style={{fontWeight: "500"}}>
      {item + " "}
    </span>
    <span style={{fontWeight: "300"}}>
      {value}
    </span>
  </span>
);

const infoBlockJSX = (item, values) => (
  <div>
    <p style={{marginBottom: "-0.7em", fontWeight: "500"}}>
      {item}
    </p>
    {values.map((k) => (
      <p key={k} style={{fontWeight: "300", marginBottom: "-0.9em", marginLeft: "0em"}}>
        {k}
      </p>
    ))}
    <br/>
  </div>
);

const getBranchDivJSX = (d) =>
  <p>{infoLineJSX("Divergence:", prettyString(d.attr.div.toExponential(3)))}</p>;

const getBranchTimeJSX = (d, temporalConfidence) => {
  const date = d.attr.date || numericToCalendar(d.attr.num_date);
  let dateRange = false;
  if (temporalConfidence) {
    dateRange = [
      numericToCalendar(d.attr.num_date_confidence[0]),
      numericToCalendar(d.attr.num_date_confidence[1])
    ];
  }
  if (dateRange && dateRange[0] !== dateRange[1]) {
    return (
      <p>
        {infoLineJSX("Inferred Date:", date)}
        <br/>
        {infoLineJSX("Date Confidence Interval:", `(${dateRange[0]}, ${dateRange[1]})`)}
      </p>
    );
  }
  return (<p>{infoLineJSX("Date:", date)}</p>);
};

/**
 * Display information about the colorBy, potentially in a table with confidences
 * @param  {node} d branch node currently highlighted
 * @param  {bool} colorByConfidence should these (colorBy conf) be displayed, if applicable?
 * @param  {string} colorBy must be a key of d.attr
 * @return {JSX} to be displayed
 */
const displayColorBy = (d, distanceMeasure, temporalConfidence, colorByConfidence, colorBy) => {
  if (colorBy.slice(0, 2) === "gt") {
    return null; /* muts ahave already been displayed */
  }
  if (colorBy === "num_date") {
    /* if colorBy is date and branch lengths are divergence we should still show node date */
    return (colorBy !== distanceMeasure) ? getBranchTimeJSX(d, temporalConfidence) : null;
  }
  if (colorByConfidence === true) {
    const lkey = colorBy + "_confidence";
    if (Object.keys(d.attr).indexOf(lkey) === -1) {
      console.error("Error - couldn't find confidence vals for ", lkey);
      return null;
    }
    const vals = Object.keys(d.attr[lkey])
      .sort((a, b) => d.attr[lkey][a] > d.attr[lkey][b] ? -1 : 1)
      .slice(0, 4)
      .map((v) => `${prettyString(v)} (${(100 * d.attr[lkey][v]).toFixed(0)}%)`);
    return infoBlockJSX(`${prettyString(colorBy)} (confidence):`, vals);
  }
  return infoLineJSX(prettyString(colorBy), prettyString(d.attr[colorBy]));
};

/**
 * Currently not used - implement when augur outputs frequencies
 * @param  {node} d branch node currently highlighted
 * @return {JSX} to be displayed (or null)
 */
// const getFrequenciesJSX = (d) => {
//   if (d.frequency !== undefined) {
//     const disp = "Frequency: " + (100 * d.frequency).toFixed(1) + "%";
//     return (<p>{disp}</p>);
//   }
//   return null;
// };

/**
 * Display AA / NT mutations in JSX
 * @param  {node} d branch node currently highlighted
 * @param  {string} mutType "AA" or "nuc"
 * @return {JSX} to be displayed (or null)
 */
const getMutationsJSX = (d, mutType) => {
  /* mutations are stored at:
  NUCLEOTIDE: d.muts = list of strings
  AMINO ACID: d.aa_muts = dict of proteins -> list of strings
  */
  if (mutType === "nuc") {
    if (typeof d.muts !== "undefined" && d.muts.length) {
      const nDisplay = 9; // max number of mutations to display
      const nGapDisp = 4; // max number of gaps/Ns to display

      // gather muts with N/-
      const ngaps = d.muts.filter((mut) => {
        return mut.slice(-1) === "N" || mut.slice(-1) === "-"
          || mut.slice(0) === "N" || mut.slice(0) === "-";
      });
      const gapLen = ngaps.length; // number of mutations that exist with N/-

      // gather muts without N/-
      const nucs = d.muts.filter((mut) => {
        return mut.slice(-1) !== "N" && mut.slice(-1) !== "-"
          && mut.slice(0) !== "N" && mut.slice(0) !== "-";
      });
      const nucLen = nucs.length; // number of mutations that exist without N/-

      let m = nucs.slice(0, Math.min(nDisplay, nucLen)).join(", ");
      m += nucLen > nDisplay ? " + " + (nucLen - nDisplay) + " more" : "";
      let mGap = ngaps.slice(0, Math.min(nGapDisp, gapLen)).join(", ");
      mGap += gapLen > nGapDisp ? " + " + (gapLen - nGapDisp) + " more" : "";

      if (gapLen === 0) {
        return infoLineJSX("Nucleotide mutations:", m);
      }
      if (nucLen === 0) {
        return infoLineJSX("Gap/N mutations:", mGap);
      }
      return (
        <p>
          {infoLineJSX("Nucleotide mutations:", m)}
          <div height="5"/>
          {infoLineJSX("Gap/N mutations:", mGap)}
        </p>
      );

    }
    return infoLineJSX("No nucleotide mutations", "");
  } else if (typeof d.aa_muts !== "undefined") {
    /* calculate counts */
    const prots = Object.keys(d.aa_muts);
    const counts = {};
    for (const prot of prots) {
      counts[prot] = d.aa_muts[prot].length;
    }
    /* are there any AA mutations? */
    if (prots.map((k) => counts[k]).reduce((a, b) => a + b, 0)) {
      const nDisplay = 3; // number of mutations to display per protein
      const nProtsToDisplay = 7; // max number of proteins to display
      let protsSeen = 0;
      const m = [];
      prots.forEach((prot) => {
        if (counts[prot] && protsSeen < nProtsToDisplay) {
          let x = prot + ":\u00A0\u00A0" + d.aa_muts[prot].slice(0, Math.min(nDisplay, counts[prot])).join(", ");
          if (counts[prot] > nDisplay) {
            x += " + " + (counts[prot] - nDisplay) + " more";
          }
          m.push(x);
          protsSeen++;
          if (protsSeen === nProtsToDisplay) {
            m.push(`(protein mutations truncated)`);
          }
        }
      });
      return infoBlockJSX("AA mutations:", m);
    }
    return infoLineJSX("No amino acid mutations", "");
  }
  console.warn("Error parsing mutations for branch", d.strain);
  return null;
};

const getBranchDescendents = (n) => {
  if (n.fullTipCount === 1) {
    return <span>{infoLineJSX("Branch leading to", n.strain)}<p/></span>;
  }
  return <span>{infoLineJSX("Number of descendants:", n.fullTipCount)}<p/></span>;
};

const getPanelStyling = (d, panelDims) => {
  const xOffset = 10;
  const yOffset = 10;
  const width = 200;

  /* this adjusts the x-axis for the right tree in dual tree view */
  const xPos = d.that.params.orientation[0] === -1 ?
    panelDims.width / 2 + panelDims.spaceBetweenTrees + d.xTip :
    d.xTip;
  const yPos = d.yTip;
  const styles = {
    container: {
      position: "absolute",
      width,
      padding: "10px",
      borderRadius: 10,
      zIndex: 1000,
      pointerEvents: "none",
      fontFamily: infoPanelStyles.panel.fontFamily,
      fontSize: 14,
      lineHeight: 1,
      fontWeight: infoPanelStyles.panel.fontWeight,
      color: infoPanelStyles.panel.color,
      backgroundColor: infoPanelStyles.panel.backgroundColor,
      wordWrap: "break-word",
      wordBreak: "break-word"
    }
  };
  if (xPos < panelDims.width * 0.6) {
    styles.container.left = xPos + xOffset;
  } else {
    styles.container.right = panelDims.width - xPos + xOffset;
  }
  if (yPos < panelDims.height * 0.55) {
    styles.container.top = yPos + 4 * yOffset;
  } else {
    styles.container.bottom = panelDims.height - yPos + yOffset;
  }
  return styles;
};

const tipDisplayColorByInfo = (d, colorBy, distanceMeasure, temporalConfidence, mutType, colorScale) => {
  if (colorBy === "num_date") {
    if (distanceMeasure === "num_date") return null;
    return getBranchTimeJSX(d.n, temporalConfidence);
  }
  if (colorBy.slice(0, 2) === "gt") {
    const key = mutType === "nuc" ?
      "Nucleotide at pos " + colorBy.replace("gt-", "").replace("nuc_", "") :
      "Amino Acid at " + colorBy.replace("gt-", "").replace("_", " site ");
    const state = getTipColorAttribute(d.n, colorScale);
    return infoLineJSX(key + ":", state);
  }
  return infoLineJSX(prettyString(colorBy) + ":", prettyString(d.n.attr[colorBy]));
};

const displayVaccineInfo = (d) => {
  if (d.n.vaccineDate) {
    return (
      <span>
        {infoLineJSX("Vaccine strain:", d.n.vaccineDate)}
        <p/>
      </span>
    );
  }
  return null;
};

/* the actual component - a pure function, so we can return early if needed */
const HoverInfoPanel = ({mutType, temporalConfidence, distanceMeasure,
  hovered, colorBy, colorByConfidence, colorScale, panelDims}) => {

  if (!hovered) return null;

  const tip = hovered.type === ".tip";
  const d = hovered.d;
  const styles = getPanelStyling(d, panelDims);
  let inner;
  if (tip) {
    inner = (
      <span>
        {displayVaccineInfo(d)}
        {tipDisplayColorByInfo(d, colorBy, distanceMeasure, temporalConfidence, mutType, colorScale)}
        {distanceMeasure === "div" ? getBranchDivJSX(d.n) : getBranchTimeJSX(d.n, temporalConfidence)}
      </span>
    );
  } else {
    inner = (
      <span>
        {getBranchDescendents(d.n)}
        {/* getFrequenciesJSX(d.n, mutType) */}
        {getMutationsJSX(d.n, mutType)}
        {distanceMeasure === "div" ? getBranchDivJSX(d.n) : getBranchTimeJSX(d.n, temporalConfidence)}
        {displayColorBy(d.n, distanceMeasure, temporalConfidence, colorByConfidence, colorBy)}
      </span>
    );
  }
  return (
    <div style={styles.container}>
      <div className={"tooltip"} style={infoPanelStyles.tooltip}>
        <div style={infoPanelStyles.tooltipHeading}>
          {tip ? d.n.strain : null}
        </div>
        {inner}
        <p/>
        <div style={infoPanelStyles.comment}>
          {tip ? "Click on tip to display more info" : "Click to zoom into clade"}
        </div>
      </div>
    </div>
  );
};

export default HoverInfoPanel;
