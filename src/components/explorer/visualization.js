import { connect } from "react-redux";
import React from "react";
import Vega from 'react-vega';
import VegaLite from 'react-vega-lite';
import * as vl from 'vega-lite';
import {createClassFromSpec} from 'react-vega';
import { getSelectedFamily, getReconstructionData, getLineageData, getSelectedReconstruction} from "../../selectors/selectedFamily";
import { getAvailableClonalFamilies } from "../../selectors/clonalFamilies";
import naiveVegaSpec from './vega/naive.js';
import clonalFamiliesVizCustomSpec from './vega/custom_scatter_plot';
import facetClonalFamiliesVizSpec from './vega/facet_scatter_plot';
import {concatTreeWithAlignmentSpec, seqAlignSpec} from './vega/clonal_family_details';
import * as explorerActions from "../../actions/explorer.js"
import * as _ from "lodash";
import Copy from "./copy";
import DownloadFasta from "./downloadfasta";
import DownloadText from "./downloadtext";



// A simple wrapper around the vega-lite-react lib's VegaLite module which prints compilation errors as
// appropriate

const MyVegaLite = args => {
  if (args.debug) {
    console.log("compiling vega-lite", args.spec)
    try {
      console.log("resulting vega", vl.compile(args.spec).spec)
    } catch (e) {
      console.error("couldn't parse vega-lite:", e)
    }
  }
  return <VegaLite {...args}/>
}


// Naive gene reassortment viz component
// =====================================

const getNaiveVizData = (datum) => {
  let result = {
    source: [
    {
      family: "5p",
      region: "CDR3",
      start: datum.cdr3_start,
      end: datum.cdr3_start + datum.cdr3_length
    },
    {
      family: "5p",
      region: "V gene",
      gene: datum.v_gene,
      start: datum.v_start,
      end: datum.v_end
    },
    {
      family: "5p",
      region: "Insertion 1",
      start: datum.v_end,
      end: datum.d_start
    },
    {
      family: "5p",
      region: "D gene",
      gene: datum.d_gene,
      start: datum.d_start,
      end: datum.d_end
    },
    {
      family: "5p",
      region: "Insertion 2",
      start: datum.d_end,
      end: datum.j_start
    },
    {
      family: "5p",
      region: "J gene",
      gene: datum.j_gene,
      start: datum.j_start,
      end: datum.j_end
    }
  ]} 
  return result 
}

const NaiveViz = createClassFromSpec(naiveVegaSpec)

const NaiveSequence = ({datum}) => {
  return <NaiveViz data = {getNaiveVizData(datum)} />;
}



// Clonal Families Viz
// ===================
//
// This is the main view in the entire vizualization as it's the first thing we always see once we explore,
// and it's the top level entry point for us in exploring datasets/clonal-families in gerater detail.
// Goal is to be super configurable and powerful.

@connect((state) => ({
  availableClonalFamilies: getAvailableClonalFamilies(state),
  selectedFamily: state.clonalFamilies.selectedFamily
}),
  //This is a shorthand way of specifying mapDispatchToProps
  {
    selectFamily: explorerActions.selectFamily,
    updateBrushSelection: explorerActions.updateBrushSelection,
    updateSelectingStatus: explorerActions.updateSelectingStatus
  })
class ClonalFamiliesViz extends React.Component {
  constructor(props) {
    super(props);
    this.xField = "n_seqs";
    this.yField = "mean_mut_freq";
    // this.spec=clonalFamiliesVizCustomSpec(props.availableClonalFamilies);
    this.spec=facetClonalFamiliesVizSpec(props.availableClonalFamilies);
  }

  render() {
    // Here we have our Vega component specification, where we plug in signal handlers, etc.
    return this.props.availableClonalFamilies.length > 0 ? <Vega
      // TURN THESE ON TO DEBUG SIGNALS
      // SEE https://github.com/matsengrp/olmsted/issues/65
      onSignalWidth={(...args) => {
        let result = args.slice(1)[0]
        console.log("width", result)
      }}
      onSignalHeight={(...args) => {
        let result = args.slice(1)[0]
        console.log("height", result)
      }}
      // onSignalBrush_x={(...args) => {
      //   let result = args.slice(1)[0]
      //   console.log('brushx: ', result)
      // }}
      // onSignalBrush_y={(...args) => {
      //   let result = args.slice(1)[0]
      //   console.log('brushy: ', result)  
      // }}
      onSignalPts_tuple={(...args) => {
        let family = args.slice(1)[0]
        if(family.ident){
          // Second argument specifies that we would like to 
          // include just this family in our brush selection
          // and therefore in the table since we have clicked it
          this.props.selectFamily(family.ident, true)
        }
      }}
      onSignalMouseDown={(...args) => {
        let coords = args.slice(1)[0]
        // Must check to see if there are actual mouse coordinates
        // here and in the mouseup signal handler just below because
        // they are triggered with undefined upon rendering the viz
        if(coords){
          this.props.updateSelectingStatus()
          this.mouseDown = true
        }
      }}
      onSignalMouseUp={(...args) => {
        let coords = args.slice(1)[0]
        if(this.mouseDown && coords){
          this.props.updateSelectingStatus()
        }
        this.mouseDown = false
      }}
      onSignalXField={(...args) => {
        let result = args.slice(1)[0]
        this.xField = result
      }}
      onSignalYField={(...args) => {
        let result = args.slice(1)[0]
        this.yField = result
      }}
      onSignalBrush_x_field_outer={(...args) => {
        let result = args.slice(1)[0]
        console.log(result)
        this.props.updateBrushSelection("x", this.xField, result)
      }}
      onSignalBrush_y_field_outer={(...args) => {
        let result = args.slice(1)[0]
        console.log(result)
        this.props.updateBrushSelection("y", this.yField, result)
      }}
      onParseError={(...args) => console.error("parse error:", args)}
      debug={/* true for debugging */ true}
      data={{source: this.props.availableClonalFamilies,
             // Here we create a separate dataset only containing the id of the
             // selected family so as to check quickly for this id within the 
             // viz to highlight the selected family.
             selected: [{'ident': this.props.selectedFamily}] }}
      spec={this.spec}/> :
      <h1>Loading</h1>
    }
};



// Phylogenetic tree & alignment viz
// =================================
//
// We show this for the given selected clonal family and reconstruction (in case there are multiple such
// reconstructions).

// First some redux connection functions

const mapStateToPropsTips = (state) => {
  return {
    selectedFamily: getSelectedFamily(state),
    treeNodes: getReconstructionData(state),
    selectedReconstruction: getSelectedReconstruction(state)
  }
}

const mapDispatchToProps = (dispatch) => ( {
  dispatchSelectedSeq: (seq) => {
    dispatch(explorerActions.updateSelectedSeq(seq))
  },
  dispatchSelectedReconstruction: (reconIdent) => {
    dispatch(explorerActions.updateSelectedReconstruction(reconIdent))
  }
})

// now for the actual component definition

@connect(mapStateToPropsTips, mapDispatchToProps , null,
  {areStatesEqual: (next, prev) => (
      _.isEqual(prev.clonalFamilies.selectedReconstruction, next.clonalFamilies.selectedReconstruction) &&
      _.isEqual(prev.clonalFamilies.selectedFamily, next.clonalFamilies.selectedFamily))})
class TreeViz extends React.Component {
  constructor(props) {
    super(props);
    this.spec=concatTreeWithAlignmentSpec(props.treeNodes)
  }

  render() {
    return <div>
            <h2>Clonal family details for {this.props.selectedFamily.sample.id} {this.props.selectedFamily.id}</h2>
            <label>Ancestral reconstruction method: </label>
            <select value={this.props.treeNodes.ident}
              onChange={(event) => this.props.dispatchSelectedReconstruction(event.target.value)}>
              {this.props.selectedFamily.reconstructions.map((recon) =>
                <option key={recon.ident} value={recon.ident}>{recon.id}</option>)}
            </select>
            <Vega onParseError={(...args) => console.error("parse error:", args)}
              onSignalPts_tuple={(...args) => {
                let node = args.slice(1)[0]
                if(node.parent){
                  // update selected sequence for lineage mode if it has a parent ie if it is not a bad request
                  this.props.dispatchSelectedSeq(node)
                }
              }}
              debug={/* true for debugging */ false}
              data={{source_0: this.props.treeNodes.asr_tree,
                     source_1: this.props.treeNodes.tips_alignment,
                    // Here we create a separate dataset only containing the id of the
                    // seed sequence so as to check quickly for this id within the 
                    // viz to color the seed blue
                     seed: this.props.selectedFamily.seed == null ? [] : [{'id': this.props.selectedFamily.seed.id}]
                  }}
              spec={this.spec}
              />
            <DownloadFasta sequencesSet={this.props.treeNodes.download_unique_family_seqs.slice()}
                           filename={this.props.selectedFamily.sample.id.concat('-',this.props.selectedFamily.id, '.fasta')}
                           label="Download Fasta: Unique Sequences In This Tree"/>
            <DownloadText  text={this.props.selectedReconstruction.newick_string}
                           filename={this.props.selectedFamily.sample.id.concat('-', this.props.selectedFamily.id, '-newick', '.txt')}
                           label="Download Clonal Family Tree Newick String"/>
          </div>
            }};


// Lineage focus viz
// =================
//
// This is the alignment viz showing the mutation history for a particular lineage

// First some redux props whathaveyou

const mapStateToPropsLineage = (state) => {
    return {
      selectedFamily: getLineageData(state),
      selectedSeq: state.clonalFamilies.selectedSeq,
    }
}

// Compoent definition

@connect(mapStateToPropsLineage, null, null, 
  {areStatesEqual: (next, prev) => {
    return _.isEqual(prev.clonalFamilies.selectedFamily, next.clonalFamilies.selectedFamily) && _.isEqual(prev.clonalFamilies.selectedSeq, next.clonalFamilies.selectedSeq)}})
class Lineage extends React.Component {
  render() {
        return <div>
          <h2>Ancestral sequences for {this.props.selectedSeq.label} lineage</h2>
          <h3>Amino acid sequence:</h3>
          <p>{this.props.selectedSeq.aa_seq}</p>
          <Copy value={this.props.selectedSeq.nt_seq ? this.props.selectedSeq.nt_seq: "NO NUCLEOTIDE SEQUENCE"} buttonLabel="Copy nucleotide sequence to clipboard"/>
          <DownloadFasta sequencesSet={this.props.selectedFamily.download_lineage_seqs.slice()}
                           filename={this.props.selectedSeq.id.concat('-lineage.fasta')}
                           label="Download Fasta: Lineage Sequences"/>
          <h3>Lineage</h3>
          <Vega
            onParseError={(...args) => console.error("parse error:", args)}
            debug={/* true for debugging */ false}
            spec={seqAlignSpec(this.props.selectedFamily)}
          />
        </div>
        }};


// export compoents
export {ClonalFamiliesViz, TreeViz, NaiveSequence, Lineage}