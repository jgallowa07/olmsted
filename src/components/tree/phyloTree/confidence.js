
export const removeConfidence = function removeConfidence(dt) {
  this.confidencesInSVG = false;
  if (dt) {
    this.svg.selectAll(".conf")
      .transition().duration(dt)
      .style("opacity", 0)
      .remove();
  } else {
    this.svg.selectAll(".conf").remove();
  }
};

export const drawConfidence = function drawConfidence(dt) {
  this.confidencesInSVG = true;
  if (dt) {
    this.confidence = this.svg.append("g").selectAll(".conf")
      .data(this.nodes)
      .enter()
      .call((sel) => this.drawSingleCI(sel, 0));
    this.svg.selectAll(".conf")
      .transition().duration(dt)
      .style("opacity", 0.5);
  } else {
    this.confidence = this.svg.append("g").selectAll(".conf")
      .data(this.nodes)
      .enter()
      .call((sel) => this.drawSingleCI(sel, 0.5));
  }
};

export const calcConfidenceWidth = (el) =>
  el["stroke-width"] === 1 ? 0 :
    el["stroke-width"] > 6 ? el["stroke-width"] + 6 :
      el["stroke-width"] * 2;

export const drawSingleCI = function drawSingleCI(selection, opacity) {
  selection.append("path")
    .attr("class", "conf")
    .attr("id", (d) => "conf_" + d.n.clade)
    .attr("d", (d) => d.confLine)
    .style("stroke", (d) => d.branchStroke || "#888")
    .style("opacity", opacity)
    .style("fill", "none")
    .style("stroke-width", calcConfidenceWidth)
    .style("pointer-events", "none"); // setting to "none" to prevent CIs from grabbing branch hovers
};
