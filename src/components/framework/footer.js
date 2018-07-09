import React from "react";
import { connect } from "react-redux";
import { dataFont, medGrey, materialButton } from "../../globalStyles";
import { prettyString } from "../../util/stringHelpers";
import { TRIGGER_DOWNLOAD_MODAL } from "../../actions/types";
import Flex from "./flex";
import { applyFilter } from "../../actions/tree";
import { changeColorBy } from "../../actions/colors";
import { version } from "../../version";

const dot = (
  <span style={{marginLeft: 10, marginRight: 10}}>
    •
  </span>
);

export const getAcknowledgments = (dispatch, styles) => {
  const preambleContent = "This work is made possible by the open sharing of genetic data by research groups from all over the world. We gratefully acknowledge their contributions.";
  const genericPreamble = (<div style={styles.preamble}>{preambleContent}</div>);

  if (window.location.pathname.includes("ebola")) {
    return (
      <div>
        {genericPreamble}
        <div style={styles.acknowledgments}>
          Special thanks to Nick Loman, Matt Cotten, Ian Goodfellow and Paul Kellam for spearheading data sharing efforts during the outbreak. For a more complete phylogeographic analysis of these data see <a target="_blank" rel="noreferrer noopener" href="http://dx.doi.org/10.1038/nature22040">Dudas et al</a>. Curated data used in the paper are available at <a target="_blank" rel="noreferrer noopener" href="https://github.com/ebov/space-time">github.com/ebov/space-time</a>. The animation shown here was inspired by <a target="_blank" rel="noreferrer noopener" href="https://youtu.be/eWnIhWUpQiQ">a work</a> by <a target="_blank" rel="noreferrer noopener" href="http://bedford.io/team/gytis-dudas/">Gytis Dudas</a>.
        </div>
      </div>
    );
  }
  if (window.location.pathname.includes("zika")) {
    return (
      <div>
        {genericPreamble}
        <div style={styles.acknowledgments}>
          Special thanks to Nick Loman, Nathan Grubaugh, Kristof Theys, Nuno Faria, Kristian Andersen, Andrew Rambaut and Karl Erlandson for data sharing, comments and suggestions.
        </div>
      </div>
    );
  }
  if (window.location.pathname.includes("mumps")) {
    return (
      <div>
        {genericPreamble}
        <div style={styles.acknowledgments}>
          Special thanks to Jennifer Gardy, Shirlee Wohl, Jeff Joy, Nathan Yozwiak, Hayden Metsky, Agatha Jassem, Louise Moncla, Gytis Dudas and Pardis Sabeti for data sharing, comments and suggestions.
        </div>
      </div>
    );
  }
  if (window.location.pathname.includes("lassa")) {
    return (
      <div style={styles.acknowledgments}>
        {"This work is made possible by the open sharing of genetic data by research groups, including these groups currently collecting Lassa sequences:"}
        <p/>
        <a href="http://acegid.org/">{"Christian Happi"}</a>
        {", "}
        <a href="https://www.sabetilab.org/">{"Pardis Sabeti"}</a>
        {", "}
        <a href="https://www.sabetilab.org/katherine-siddle/">{"Katherine Siddle"}</a>
        {" and colleagues, whose data was shared via "}
        <a target="_blank" rel="noreferrer noopener" href="http://virological.org/t/new-lassa-virus-genomes-from-nigeria-2015-2016/191">{"this viroligical.org post. "}</a>
        {"If you intend to use these sequences prior to publication, please contact them directly to coordinate. "}
        <span className={"link"} onClick={() => dispatch(applyFilter("authors", ["Odia_et_al"], 'set'))}>{"Click here"}</span>
        {" here to see these sequences in isolation."}

        <p/>

        {`The Irrua specialist Teaching Hospital (ISTH) and Institute for Lassa Fever Research and Control (ILFRC), Irrua, Edo State, Nigeria;
          The Bernhard-Nocht Institute for Tropical Medicine (BNITM), Hamburg, Germany;
          Public Health England (PHE);
          African Center of Excellence for Genomics of Infectious Disease (ACEGID ), Redeemer’s University, Ede, Nigeria;
          Broad Institute of MIT and Harvard University (Cambridge, MA, USA).
          For further details, including conditions of reuse, please contact `}
        <a href="mailto:epogbaini@yahoo.com">{"Ephraim Epogbaini"}</a>
        {", "}
        <a href="http://www.who.int/blueprint/about/stephan-gunther/en/">{"Stephan Günther"}</a>
        {" and "}
        <a href="https://rega.kuleuven.be/cev/ecv/lab-members/PhilippeLemey.html">{"Philippe Lemey"}</a>
        {". Their data was first shared via "}
        <a target="_blank" rel="noreferrer noopener" href="http://virological.org/t/2018-lasv-sequencing-continued/192/8">{"this viroligical.org post"}</a>
        {', which is continually updated. '}
        <span className={"link"} onClick={() => dispatch(applyFilter("authors", ["ISTH-BNITM-PHE"], 'set'))}>{"Click here"}</span>
        {" here to see these sequences in isolation."}
      </div>
    );
  }
  if (window.location.pathname.includes("WNV/NA")) {
    return (
      <div style={styles.acknowledgments}>
        {`This work is possible due to the groups who have made their data openly available for analysis -
          with a special thanks to Nikos Gurfield, Saran Grewal, Chris Barker, Ying Fang and the Andersen Lab for making `}
        <a href="https://andersen-lab.com/secrets/data/west-nile-genomics/">{"their data"}</a>
        {` available ahead of publication. `}
        {`We also thank Simon Dellicour, Sebastian Lequime, Bram Vrancken, Philippe Lemey, Karthik Gangavarapu, Nate Matteson, Sharada Saraf,
          Kristian Andersen, and Nathan Grubaugh for curating the original dataset.
          The data is being maintained by `}
        <a target="_blank" rel="noreferrer noopener" href="http://grubaughlab.com">{"Nathan Grubaugh and his lab"}</a>
        {`. Our goal is to promote sequencing and sharing of West Nile virus genomes to improve our understanding of virus spread and evolution.
          To aid in this effort, they have adapted their highly multiplexed PCR approach for `}
        <a target="_blank" rel="noreferrer noopener" href="https://www.nature.com/articles/nprot.2017.066">{"Zika virus sequencing"}</a>
        {` on the Illumina and Minion platforms for West Nile Virus circulating in North America. Their `}
        <a target="_blank" rel="noreferrer noopener" href="http://grubaughlab.com/open-science/amplicon-sequencing/">{"sequencing protocol and primers"}</a>
        {` are free to use.
          If you have any questions about West Nile virus sequencing, or if you have unpublished data that you would like to share, please email `}
        <a href="emailto:grubaughlab@gmail.com">{"grubaughlab@gmail.com"}</a>
        {"."}

        <p/>
        {`All data shown here are coding-complete genomes.`}

        <p/>
        {"WNV is split into three phenotypically relevant strains - NY99, WN02 and SW03 ("}
        <span className={"link"} onClick={() => dispatch(changeColorBy("lineage"))}>{"click here"}</span>
        {" to colour the tree by this). These strains are defined by these mutations (click to change the colouring of the tree):"}
        <ul>
          <li>
            <span className={"link"} onClick={() => dispatch(changeColorBy("gt-env_159"))}>{"env-V159A"}</span>
            {" designates the switch from NY99 (the original sequence) to WN02."}
          </li>
          <li>
            <span className={"link"} onClick={() => dispatch(changeColorBy("gt-NS4A_85"))}>{"NS4A-A85T"}</span>
            {" designates the switch from WN02 to SW03 (WN02 displaced NY99; WN02 and SW03 co-circulate)."}
          </li>
        </ul>
      </div>
    );
  }
  if (window.location.pathname.includes("h7n9")) {
    return (
      <div style={styles.acknowledgments}>
        We thank the <a target="_blank" rel="noreferrer noopener" href="https://gisaid.org">GISAID Initiative</a> for enabling genomic surveillance of influenza and for providing a critical data sharing platform, and all of the groups who contribute to it.
      </div>
    );
  }
  if (window.location.pathname.includes("flu")) {
    return (
      <div>
        <div style={styles.acknowledgments}>
          We thank the <a target="_blank" rel="noreferrer noopener" href="https://gisaid.org">GISAID Initiative</a> and the <a target="_blank" rel="noreferrer noopener" href="http://www.who.int/influenza/gisrs_laboratory/en/">GISRS Network</a> for critical surveillance efforts and open data sharing. Titer data used in antigenic analysis was generated by the <a target="_blank" rel="noreferrer noopener" href="https://www.cdc.gov/flu/">Influenza Division at the US Centers for Disease Control and Prevention</a>, the <a target="_blank" rel="noreferrer noopener" href="http://www.crick.ac.uk/research/worldwide-influenza-centre">Worldwide Influenza Centre at the Francis Crick Institute</a>, the <a target="_blank" rel="noreferrer noopener" href="http://www.vidrl.org.au/">Victorian Infectious Diseases Reference Laboratory at the Australian Peter Doherty Institute for Infection and Immunity</a> and the <a target="_blank" rel="noreferrer noopener" href="https://www.niid.go.jp/niid/en/flu-e.html">Influenza Virus Research Center at the Japan
          National Institute of Infectious Diseases</a>.
        </div>
        <div style={styles.acknowledgments}>
          Special thanks to Jackie Katz, Dave Wentworth, Becky Garten, Vivien Dugan, Xiyan Xu, Elizabeth Neuhaus, Sujatha Seenu, John McCauley, Rod Daniels, Vicki Gregory, Kanta Subbarao, Ian Barr, Aeron Hurt, Takato Odagiri, Shinji Watanabe, Tomoko Kuwahara, Michael Lässig, Marta Łuksza, Richard Reeve, Colin Russell, Sebastian Maurer-Stroh and Peter Bogner for feedback and advice. This analysis represents an updated frontend to the Nextflu informatic pipeline. This site is now our canonical analysis of seasonal influenza evolution. The old frontend can be found at <a target="_blank" rel="noreferrer noopener" href="https://nextflu.org/deprecated/">nextflu.org/deprecated/</a> for the intermediate future.
        </div>
      </div>
    );
  }
  return (
    <div>
      {genericPreamble}
    </div>
  );
};

const dispatchFilter = (dispatch, activeFilters, key, value) => {
  const mode = activeFilters[key].indexOf(value) === -1 ? "add" : "remove";
  console.log(key, value)
  dispatch(applyFilter(key, [value], mode));
};

export const displayFilterValueAsButton = (dispatch, activeFilters, filterName, itemName, display, showX) => {
  const active = activeFilters[filterName].indexOf(itemName) !== -1;
  if (active && showX) {
    return (
      <div key={itemName} style={{display: "inline-block"}}>
        <div
          className={'boxed-item-icon'}
          onClick={() => {dispatchFilter(dispatch, activeFilters, filterName, itemName);}}
          role="button"
          tabIndex={0}
        >
          {'\xD7'}
        </div>
        <div className={"boxed-item active-with-icon"}>
          {display}
        </div>
      </div>
    );
  }
  if (active) {
    return (
      <div
        className={"boxed-item active-clickable"}
        key={itemName}
        onClick={() => {dispatchFilter(dispatch, activeFilters, filterName, itemName);}}
        role="button"
        tabIndex={0}
      >
        {display}
      </div>
    );
  }
  return (
    <div
      className={"boxed-item inactive"}
      key={itemName}
      onClick={() => {dispatchFilter(dispatch, activeFilters, filterName, itemName);}}
      role="button"
      tabIndex={0}
    >
      {display}
    </div>
  );
};

const removeFiltersButton = (dispatch, filterNames, outerClassName, label) => {
  return (
    <div
      className={`${outerClassName} boxed-item active-clickable`}
      style={{paddingLeft: '5px', paddingRight: '5px', display: "inline-block"}}
      onClick={() => {
        filterNames.forEach((n) => dispatch(applyFilter(n, [], 'set')));
      }}
    >
      {label}
    </div>
  );
};

@connect((state) => {
  return {
    tree: state.tree,
    totalStateCounts: state.tree.totalStateCounts,
    metadata: state.metadata,
    colorOptions: state.metadata.colorOptions,
    browserDimensions: state.browserDimensions.browserDimensions,
    activeFilters: state.controls.filters
  };
})
class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.getStyles = () => {
      /* the styles of the individual items is set in CSS */
      const styles = {
        footer: {
          marginLeft: "30px",
          paddingBottom: "30px",
          fontFamily: dataFont,
          fontSize: 15,
          fontWeight: 300,
          color: medGrey,
          lineHeight: 1.4
        },
        acknowledgments: {
          marginTop: "10px"
        },
        citationList: {
          marginTop: "10px",
          lineHeight: 1.0
        },
        line: {
          marginTop: "20px",
          marginBottom: "20px",
          borderBottom: "1px solid #CCC"
        },
        preamble: {
          fontSize: 15
        },
        fineprint: {
          fontSize: 14
        }
      };
      return styles;
    };
  }
  shouldComponentUpdate(nextProps) {
    if (this.props.tree.version !== nextProps.tree.version ||
    this.props.browserDimensions !== nextProps.browserDimensions) {
      return true;
    } else if (Object.keys(this.props.activeFilters) !== Object.keys(nextProps.activeFilters)) {
      return true;
    } else if (Object.keys(this.props.activeFilters)) {
      for (const name of this.props.activeFilters) {
        if (this.props.activeFilters[name] !== nextProps.activeFilters[name]) {
          return true;
        }
      }
    }
    return false;
  }

  displayFilter(styles, filterName) {
    const totalStateCount = this.props.totalStateCounts[filterName];
    return (
      <div>
        {`Filter by ${prettyString(filterName)}`}
        {this.props.activeFilters[filterName].length ? removeFiltersButton(this.props.dispatch, [filterName], "inlineRight", `Clear ${filterName} filter`) : null}
        <Flex wrap="wrap" justifyContent="flex-start" alignItems="center" style={styles.citationList}>
          {Object.keys(totalStateCount).sort().map((itemName) => {
            let display;
            if (filterName === "authors") {
              display = (
                <span>
                  {prettyString(itemName, {stripEtAl: true})}
                  {" et al (" + totalStateCount[itemName] + ")"}
                </span>
              );
            } else {
              display = (
                <span>
                  {prettyString(itemName)}
                  {" (" + totalStateCount[itemName] + ")"}
                </span>
              );
            }
            return displayFilterValueAsButton(this.props.dispatch, this.props.activeFilters, filterName, itemName, display, false);
          })}
        </Flex>
      </div>
    );
  }

  getUpdated() {
    let updated = null;
    if (this.props.metadata.updated) {
      updated = this.props.metadata.updated;
    }
    if (!updated) return null;
    return (
      <span>Data updated {updated}</span>
    );
  }
  downloadDataButton() {
    return (
      <button
        style={Object.assign({}, materialButton, {backgroundColor: "rgba(0,0,0,0)", color: medGrey, margin: 0, padding: 0})}
        onClick={() => { this.props.dispatch({ type: TRIGGER_DOWNLOAD_MODAL }); }}
      >
        <i className="fa fa-download" aria-hidden="true"/>
        <span style={{position: "relative"}}>{" download data"}</span>
      </button>
    );
  }
  getMaintainer() {
    if (Object.prototype.hasOwnProperty.call(this.props.metadata, "maintainer")) {
      return (
        <span>
          Build maintained by <a href={this.props.metadata.maintainer[1]} target="_blank">{this.props.metadata.maintainer[0]}</a>
        </span>
      );
    }
    return null;
  }

  render() {
    if (!this.props.metadata || !this.props.tree.nodes) return null;
    const styles = this.getStyles();
    const width = this.props.width - 30; // need to subtract margin when calculating div width
    return (
      <div style={styles.footer}>
        <div style={{width: width}}>
          <div style={styles.line}/>
          {getAcknowledgments(this.props.dispatch, styles)}
          <div style={styles.line}/>
          {Object.keys(this.props.activeFilters).map((name) => {
            return (
              <div key={name}>
                {this.displayFilter(styles, name)}
                <div style={styles.line}/>
              </div>
            );
          })}
          <Flex style={styles.fineprint}>
            {this.getMaintainer()}
            {dot}
            {this.getUpdated()}
            {dot}
            {"Auspice " + version}
          </Flex>
        </div>
      </div>
    );
  }
}

// {dot}
// {this.downloadDataButton()}

export default Footer;
