
import * as _ from "lodash";

// Defines the order in which we specify corresponding colors
const aminoAcidDomain = [ 
  '-',
  'X',
  'A', 
  'C',
  'D',
  'E',
  'F',
  'G',
  'H', 
  'I', 
  'K', 
  'L',
  'M',
  'N', 
  'P', 
  'Q', 
  'R', 
  'S', 
  'T',
  'V', 
  'W',
  'Y' 
 ]

// AMINO ACID COLORS
// tableau20 colorset of unique colors, with transparent added for gaps and X (any).
// We are using text rather than color to distinguish these characters 
// See https://github.com/matsengrp/olmsted/issues/48
// Also note that this order of characters is IMPORTANT because
// it maps directly to the order of the domain (see above aminoAcidDomain) of the mutations marks
const tableau20plusColors = [
  "transparent", // '-' Gap (insertion / deletion)
  "transparent", //  X - (Any amino acid)
  "#1f77b4",     //  A - Ala - Alanine
  "#aec7e8",     //	 C - Cys - Cysteine
  "#ff7f0e",     //  D - Asp - Aspartic Acid
  "#ffbb78",     //  E - Glu - Glutamic Acid
  "#2ca02c",     //	 F - Phe - Phenylalanine
  "#98df8a",     //	 G - Gly - Glycine
  "#d62728",     //  H - His - Histidine
  "#ff9896",     //	 I - Ile - Isoleucine
  "#9467bd",     //  K - Lys - Lysine
  "#c5b0d5",     //	 L - Leu - Leucine
  "#8c564b",     //	 M - Met - Methionine
  "#c49c94",     //  N - Asn - Asparagine
  "#e377c2",     //	 P - Pro - Proline
  "#f7b6d2",     //  Q - Gln - Glutamine
  "#7f7f7f",     //  R - Arg - Arginine
  "#c7c7c7",     //	 S - Ser - Serine
  "#bcbd22",     //	 T - Thr - Threonine
  "#dbdb8d",     //	 V - Val - Valine
  "#17becf",     //	 W - Trp - Tryptophan
  "#9edae5"      //	 Y - Tyr - Tyrosine
]

// Alternatively: 
// As seen in cft web, colors from http://www.imgt.org/IMGTScientificChart/RepresentationRules/colormenu.php#h1_0
// again, with transparent added for gaps and X (any) see https://github.com/matsengrp/olmsted/issues/48
// (EH) these are pretty vibrant and hard to look at
const IMGTScientificChartColors = [
  'transparent', // '-' Gap (insertion / deletion)
  'transparent', //  X - (Any amino acid)
  '#CCFFFF',     //	 A - Ala - Alanine
  '#00FFFF',     //	 C - Cys - Cysteine
  '#FFCC99',     //  D - Asp - Aspartic Acid
  '#FFCC00',     //  E - Glu - Glutamic Acid
  '#00CCFF',     //	 F - Phe - Phenylalanine
  '#00FF00',     //	 G - Gly - Glycine
  '#FFFF99',     //  H - His - Histidine
  '#000080',     //	 I - Ile - Isoleucine
  '#C64200',     //  K - Lys - Lysine
  '#3366FF',     //	 L - Leu - Leucine
  '#99CCFF',     //	 M - Met - Methionine
  '#FF9900',     //  N - Asn - Asparagine
  '#FFFF00',     //	 P - Pro - Proline
  '#FF6600',     //  Q - Gln - Glutamine
  '#E60606',     //  R - Arg - Arginine
  '#CCFF99',     //	 S - Ser - Serine
  '#00FF99',     //	 T - Thr - Threonine
  '#0000FF',     //	 V - Val - Valine
  '#CC99FF',     //	 W - Trp - Tryptophan
  '#CCFFCC',     //	 Y - Tyr - Tyrosine    
]

const concatTreeWithAlignmentSpec = () => {
  return(
    {
      "$schema": "https://vega.github.io/schema/vega/v4.json",
      "description": "",
      // "autosize": {"type": "pad", "resize": false},
      "height": 800,
      "width": 1000,
      // Note that we have some datasets named for signals
      // these are a current way around being able to set
      // the initial values of signals through the props 
      // of a react-vega component. See https://github.com/kristw/react-vega/issues/13
      "data": [
        {
          // The available screen height
          "name": "available_height"
        },
        {
          // The number of sequences to show in the 
          // alignment is the leaves + the naive
          "name": "leaves_count_incl_naive"
        },
        {
          // This is for the naive gene regions shown 
          // at the top of the viz
          "name": "naive_data",
        },
        {
          // For showing the cdr3 with dotted lines in the alignment
          "name": "cdr3_bounds",
        },
        {
          // Stores points that have been clicked on
          "name": "pts_store"
        },
        {
          // Stores the id of the seed
          "name": "seed"
        },
        // Tree Data
        {
          // Raw tree data
          "name": "source_0",
        },
        {"name": "tree", 
         "transform": [
                        {"expr": "datum.distance", "type": "formula", "as": "x"}, 
                        {"expr": "datum.height * leaf_size", "type": "formula", "as": "y"},
                        {"type": "extent", "field": "distance", "signal": "distance_extent"},                
                        { "type": "extent", "field": "x", "signal": "xext" },
                        { "type": "extent", "field": "y", "signal": "yext" },
                        {"key": "id", "type": "stratify", "parentKey": "parent"},
                        {"expr": "scale(\"xscale\", datum.distance)", "type": "formula", "as": "x"}, 
                       ],

         "source": "source_0"},
        {"name": "links",
         "transform": [{"key": "id", "type": "treelinks"},
                       {"shape": "orthogonal", "type": "linkpath", "orient": "horizontal"}],
         "source": "tree"},
        {"name": "nodes", "transform": [{"expr": "datum.type == 'node' || datum.type =='root'", "type": "filter"}],
          "source": "tree"},
        {"name": "leaves", "transform": [{ "expr": "datum.type == 'leaf'", "type": "filter"}], "source": "tree"},
        {"name": "leaf_pies", "transform": [{ "type": "flatten", "fields": ["timepoint_multiplicities"]},
                                            {
                                              "type": "formula",
                                              "expr": "datum.timepoint_multiplicities.timepoint", "as": "timepoint_multiplicity_key"
                                            },
                                            {
                                              "type": "formula",
                                              "expr": "datum.timepoint_multiplicities.multiplicity", "as": "timepoint_multiplicity_value"
                                            },
                                            {
                                              "type": "pie",
                                              "field": "timepoint_multiplicity_value",
                                              "startAngle": 0,
                                              "endAngle": {"signal": "length(data('leaves'))*6.29"}
                                            }],
          "source": "leaves"},
        // Mutations Data
        {
          // Raw alignment data / mutations records
          "name": "source_1",
        },
        {"name": "data_1",
         "source": "source_1",
         "transform": [
           {
             "type": "formula",
             "expr": "toNumber(datum[\"position\"])",
             "as": "position"
           },
           {"expr": "datum.height * leaf_size", "type": "formula", "as": "y"}
         ]
        },
        // Separate dataset for just gap characters and Xs to label them with text marks
        {"name": "x_and_gaps",
         "source": "data_1",
         "transform": [
            {
              "type": "filter",
              "expr": "datum.mut_to == \"-\" || datum.mut_to == \"X\""
            }
          ]
        }
      ],
      "signals": [
        //ZOOOOOOM
        {
          "name": "hover",
          "on": [
            {"events": "*:mouseover", "encode": "hover"},
            {"events": "*:mouseout",  "encode": "leave"},
            {"events": "*:mousedown", "encode": "select"},
            {"events": "*:mouseup",   "encode": "release"}
          ]
        },
        { "name": "xrange", "update": "[0, scaledWidth]" },
        { "name": "yrange", "update": "[height, 0]" },
    
        {
          "name": "down", "value": null,
          "on": [
            {"events": "touchend", "update": "null"},
            {"events": "mousedown, touchstart", "update": "xy()"}
          ]
        },
        {
          "name": "xcur", "value": null,
          "on": [
            {
              "events": "mousedown, touchstart, touchend",
              "update": "slice(xdom)"
            }
          ]
        },
        {
          "name": "delta", "value": [0, 0],
          "on": [
            {
              "events": [
                {
                  "source": "window", "type": "mousemove", "consume": true,
                  "between": [{"type": "mousedown"}, {"source": "window", "type": "mouseup"}]
                },
                {
                  "type": "touchmove", "consume": true,
                  "filter": "event.touches.length === 1"
                }
              ],
              "update": "down ? [down[0]-x(), y()-down[1]] : [0,0]"
            }
          ]
        },
        // This is the anchor from which zoom happens.
        // It's set to the place you scroll at now but my best 
        // shot at scrolling only in the positive x direction so 
        // far is to set it to always be [0,0]. This generally works,
        // but might not be perfect for zooming on clades far from root
        // We need a way to just limit zoom out to not go past zero?
        {
          "name": "anchor", "value": [0, 0],
          "on": [
            {
              "events": "wheel",
              "update": "[invert('xscale', x()), 0]"
            },
            {
              "events": {"type": "touchstart", "filter": "event.touches.length===2"},
              "update": "[(xdom[0] + xdom[1]) / 2, y()]"
            }
          ]
        },
        {
          "name": "zoom", "value": 1,
          "on": [
            {
              "events": "wheel!",
              "force": true,
              "update": "pow(1.001, event.deltaY * pow(16, event.deltaMode))"
            },
            {
              "events": {"signal": "dist2"},
              "force": true,
              "update": "dist1 / dist2"
            }
          ]
        },
        {
          "name": "dist1", "value": 0,
          "on": [
            {
              "events": {"type": "touchstart", "filter": "event.touches.length===2"},
              "update": "pinchDistance(event)"
            },
            {
              "events": {"signal": "dist2"},
              "update": "dist2"
            }
          ]
        },
        {
          "name": "dist2", "value": 0,
          "on": [{
            "events": {"type": "touchmove", "consume": true, "filter": "event.touches.length===2"},
            "update": "pinchDistance(event)"
          }]
        },
    
        {
          "name": "xdom", "update": "slice(xext)", "react": false,
          "on": [
            {
              "events": {"signal": "delta"},
              "update": "[xcur[0] + span(xcur) * delta[0] / scaledWidth, xcur[1] + span(xcur) * delta[0] / scaledWidth]"
            },
            {
              "events": {"signal": "zoom"},
              "update": "[anchor[0] + (xdom[0] - anchor[0]) * zoom, anchor[0] + (xdom[1] - anchor[0]) * zoom]"
            }
          ]
        },
        {
          "name": "size",
          "update": "clamp(20 / span(xdom), 1, 1000)"
        },
        // TREE SIGNALS
        // Number of leaves
        {
          "name": "leaves_count_incl_naive",
          // This - like other signals we'd like to initialize 
          // from outside the spec, is passed in dynamically as 
          // data and read from the data here, so as to not re-initialize
          // the spec
          "update": "data(\"leaves_count_incl_naive\")[0].data"
        },
        // BRANCHSCALE - scales up width of tree
        {
          "value": 950,
          "name": "branchScale",
          "bind": {"max": 7000, "step": 50, "input": "range", "min": 0}
        },

        // HEIGHTSCALE SIGNALS BEGIN
        {
          "name": "available_height",
          // This updates the height based on the initial
          // value passed as data from the react component:
          "update": "floor(data(\"available_height\")[0].data * 0.9)",
          // This updates the height based on the resizing 
          // of the screen without reinitializing the viz:
          "on": [
            {
              "events": {"source": "window", "type": "resize"},
              "update": "floor(windowSize()[1]*0.9)"
            }
          ]
        },
        {
          "value": 1,
          "name": "heightScale",
          "bind": {"max": 2, "step": 0.1, "input": "range", "min": 0.1}
        },
        // Height resizes to fit the screen height but is scaled by a
        // a custom factor (see above heightScale slider)
        // also see https://github.com/matsengrp/olmsted/issues/83)
        {
          "name": "height",
          "update": "heightScale * available_height",
          "on": [
            {
              "events": [{"signal": "heightScale"}, {"signal": "available_height"}],
              "update": "heightScale * available_height"
            }
          ]
        },
        // This is used through out as the unit defining
        // the vertical spacing of leaves in the tree and 
        // mutation marks in the alignment
        {
          "name": "leaf_size",
          "update": "height/leaves_count_incl_naive"
        },
         // Size of leaves - they are mapped to a range with
         // the value of this signal as the maximum
        {
          "name": "max_leaf_size",
          "value": 50,
          "bind": {"max": 100, "step": 1, "input": "range", "min": 1}
        },
        // HEIGHTSCALE SIGNALS END
        {
          // Metadata field to use for sizing the leaves
          "name": "leaf_size_by",
          "value": "multiplicity",
          "bind": {"input": "select", "options": ["multiplicity", "cluster_multiplicity"]} 
        },
        {
          "value": true,
          "name": "show_labels",
          "bind": {"input": "radio", "options": [true, false]}
        },
        {
          // Label size for tree leaves (clamped to max value of 10)
          "name": "label_size",
          "update": "clamp(leaf_size, 0, 10)"
        },        
        {
          "value": "datum",
          "name": "cladify",
          "on": [{"update": "datum", "events": "@ancestor:mousedown, @ancestor:touchstart"}]
        },
        {
          "name": "concat_0_x_step", "value": 0
        },
        {
          "name": "scaledWidth",
          // "value": 500,
         "update": "branchScale"
        },
        {
          "name": "unit",
          "value": {},
          "on": [
            {"events": "mousemove", "update": "isTuple(group()) ? group() : unit"}
          ]
        },
        // #59 this will need to be controlled by slider 
        {
          "name": "concat_0_width",
          "update": "branchScale*distance_extent[1]"
        },
        
        // On click stuff
        {
          "name": "pts",
          "update": "data(\"pts_store\").length && {_vgsid_: data(\"pts_store\")[0]}"
        },
        {
         "name": "pts_tuple",
         "value": {},
         "on": [
           {
             "events": [{"source": "scope", "type": "click"}],
             "update": "datum && (item().mark.marktype == 'text' || item().mark.marktype == 'symbol') ? datum : null",
           }
         ]
        },
        {
          "name": "pts_modify",
          "on": [
            {
              "events": {"signal": "pts_tuple"},
              "update": "modify(\"pts_store\", pts_tuple, true)"
            }
          ]
        },
        // ALIGNMENT SIGNALS
        {
          // Size of mutation marks vertically, clamped to max 20
          "name": "mutation_mark_height",
          "update": "clamp(leaf_size*0.9, 0, 20)"
        },
        {
          "name": "mutation_mark_width",
          "update": "ceil(width/150)"
        },
        // #59 this will need to be controlled by slider 
        {
          "name": "concat_1_width",
          "update": "width - concat_0_width"
        }
      ],
      //LAYOUT: how to space the two concattenated viz groups with respect to one another
      "layout": {
        "padding": {"column": 0},
        // Ideally we'd set bounds: flush to get the leaf labels flush with the tick marks
        // for the alignment viz, but the leaf labels are not always the same length so 
        // we can't correct for them with padding. See hack in evolutionary axis title
        "bounds": "full",
        "align": "each"
      },
      "marks": [
        // TREE
        {
          "type": "group",
          "name": "concat_0_group",
          "encode": {
              "update": {
                "clip": {"value": true},
                "width": {"signal": "scaledWidth"},
                "height": {"signal": "scaledHeight"}
            }
          },
          "marks": [
            // LINKS
            {
              "encode": {
                "update": {
                  "path": {"field": "path"},
                  "strokeWidth": {"value": 2},
                  "stroke": {"value": "#ccc"}
                }
              },
              "type": "path",
              "from": {"data": "links"}
            },
            // INTERNAL NODES
            {
              "name": "ancestor",
              "encode": {
                "update": {
                  "y": {"field": "y"},
                  "fill": {"value": "transparent"},
                  "x": {"field": "x"},
                  "tooltip": {
                    "signal": "{\"height\": format(datum[\"height\"], \"\"), \"id\": datum[\"id\"], \"parent\": datum[\"parent\"]}"
                  }
                },
                "enter": {
                  "size": {"value": 20},
                  // Change this to black to see internal nodes
                  "stroke": {"value": "transparent"},
                }
              },
              "type": "symbol",
              "from": {"data": "nodes"}
            },
            // LEAVES
            // Pie charts: size depends on multiplicity 
            { "name": "pie",
              "type": "arc",
              "from": {"data": "leaf_pies"},
              "encode": {
                "update": {
                  "fill": {"scale": "simple_color", "field": "timepoint_multiplicity_key"},
                  "fillOpacity": {"value": "0.5"},
                  "x": {"field": "x"},
                  "y": {"field": "y"},
                  "startAngle": {"field": "startAngle"},
                  "endAngle": {"field": "endAngle"},
                  // Set inner radius to get donuts instead of pie charts
                  // "innerRadius": {"scale": "leaf_size_scale", "field": {"signal": "leaf_size_by"}},
                  "tooltip": {
                    "signal": "{\"id\": datum[\"id\"], \"parent\": datum[\"parent\"], \"distance\": datum[\"distance\"], \"multiplicity\": datum[\"multiplicity\"], \"cluster_multiplicity\": datum[\"cluster_multiplicity\"], \"timepoint\": datum[\"timepoint_multiplicity_key\"], \"timepoint multiplicity\": datum[\"timepoint_multiplicity_value\"]}"
                  },
                  "outerRadius": {"scale": "leaf_size_scale", "field": {"signal": "leaf_size_by"}},
                }
              }
            },
            {
              "name": "leaf_center",
              "encode": {
                "update": {
                  "y": {"field": "y"},
                  "fill": {"value": "#000"},
                  "stroke": {"value": "#000"},
                  "x": {"field": "x"},
                  "size": [
                    {"test": "show_labels", "value": 1},
                    {"signal": "leaf_size*2"}
                  ],
                  "cursor": {"value": "pointer"}
                },
              },
              "type": "symbol",
              "from": {"data": "leaves"}
            },
            // labels
            {
              "type": "text",
              "encode": {
                "update": {
                  "text": [
                    {"test": "show_labels", "field": "label"},
                    {"value": null}
                  ],
                  // Show selected sequence as darker, default to all grey #80
                  "opacity":
                  [
                    {"test": "pts_tuple.id == null || datum.id !== pts_tuple.id", "value": 0.5},
                    {"value": 1}
                  ],
                  // Make seed larger #78
                  "fontSize":
                  [
                    {"test": "indata('seed', 'id', datum.id)",  "signal": "label_size*1.5"},
                    {"signal": "label_size"}
                  ]  ,
                  // Bold the seed #78
                  "fontWeight": [
                    {"test": "indata('seed', 'id', datum.id)", "value": "bold"},
                    {"value": "normal"}
                  ],
                  "cursor": {"value": "pointer"},
                  "y": {"scale": "y", "field": "y"},
                  "dx": {"scale": "leaf_label_offset", "field": {"signal": "leaf_size_by"}},
                  "dy": {"value": 3},
                  "x": {"field": "x"},
                  "tooltip": {
                    "signal": "{\"id\": datum[\"id\"], \"parent\": datum[\"parent\"], \"distance\": datum[\"distance\"], \"multiplicity\": datum[\"multiplicity\"], \"cluster_multiplicity\": datum[\"cluster_multiplicity\"], \"*tree height\": datum[\"height\"]}"
                  }
                }  
              },
              "from": {"data": "leaves"}
            },
          ],
          // Tree axes
          "axes": [{
            "scale": "xscale",
            "orient": "bottom",
            "grid": false,
            // See layout section: the axes get included in the group width when you have 
            // bound: full. We need bounf: full to account for the leaf labels going beyond
            // the exact width; this setting allows them to be included in our width. However,
            // since this setting also includes the axis title in the overall width, we collapse
            // it when the branch scale is 0 because we want to be able to have the leaf labels 
            // flush with the tick marks for the alignment viz.
            "title": {"signal": "branchScale > 0 ? 'Evolutionary distance from naive' : ''"},
            "labelFlush": true,
            "labelOverlap": true,
            "tickCount": {"signal": "ceil(scaledWidth/40)"},
            "zindex": 1
          }]
        },
        // SEQUENCE ALIGNMENT
        {
          "type": "group",
          "name": "concat_1_group",
          "style": "cell",
          "encode": {
            "update": {
              "width": {"signal": "concat_1_width"},
              "height": {"signal": "scaledHeight"}
            }
          },
          "marks": [
            {
              "name": "naive",
              "type": "rect",
              "style": [
                "bar"
              ],
              "from": {
                "data": "naive_data"
              },
              "encode": {
                "update": {
                  "fill": {"scale": "naive_color", "field": "region"},
                  "tooltip": {
                    "signal": "{\"region\": ''+datum[\"region\"], \"start\": format(datum[\"start\"], \"\"), \"end\": format(datum[\"end\"], \"\"),  \"gene\": ''+datum[\"gene\"]}"
                  },
                  "x": {
                    "scale": "x",
                    "signal": "floor(datum[\"start\"]/3)-0.5"
                  },
                  "x2": {
                    "scale": "x",
                    "signal": "floor(datum[\"end\"]/3)+0.5"
                  },
                   "yc":{"signal": "-1.5*mutation_mark_height"},
                  "height": [
                    {
                      "test": "datum[\"region\"] == 'CDR3'",
                      "signal": "mutation_mark_height*2"
                    },
                    {"signal": "mutation_mark_height"}      
                ],
                }
              }
            },
            {
              "name": "rule_cdr3",
              "type": "rule",
              "from": {"data": "cdr3_bounds"},
              "encode": {
                "enter": {
                  "stroke": {"value": "black"},
                  "fill": {"value": "black"},
                  "opacity": {"value": 0.6}
                },
                "update": {
                  "x": {"scale": "x", "field": "x"},
                  "y": {"signal": "-1*mutation_mark_height"},
                  "y2": {"signal": "height"},
                  "strokeWidth": {"value": 1},
                  "strokeDash": {"value": [12,4]},
                  "strokeCap": {"value": "butt"},
                  "opacity": {"value": 1},
                }
              }
            },
            // MUTATIONS MARKS
            {
              "name": "marks",
              "type": "rect",
              "style": ["tick"],
              "from": {"data": "data_1"},
              "encode": {
                "update": {
                  "opacity": {"value": 0.9},
                  // Set opacity similar to this (but with indata and store data set of with hovered id) for hovered data for #24:
                  // [
                  //   {"test": "pts_tuple.id == null || datum.seq_id == pts_tuple.id || datum.seq_id == 'inferred_naive'", "value": 0.9},
                  //   {"value": 0.1}
                  // ],
                  "fill": [
                    {
                      "test": "datum[\"position\"] === null || isNaN(datum[\"position\"])",
                      "value": null
                    },
                    {"scale": "aa_color", "field": "mut_to"}
                  ],
                  "tooltip": {
                    "signal": "{\"position\": format(datum[\"position\"], \"\"), \"seq_id\": ''+datum[\"seq_id\"], \"mut_to\": ''+datum[\"mut_to\"], \"mut_from\": ''+datum[\"mut_from\"]}"
                  },
                  "xc": {"scale": "x", "field": "position"},
                  "yc": {"scale": "y", "field": "y"},
                  "height": {"signal": "mutation_mark_height"},
                  "width": {"signal": "mutation_mark_width"}
                }
              }
            },
            // Gap character labels
            {
              "name": "x_and_gaps_labels",
              "type": "text",
              "from": {"data": "x_and_gaps"},
              "encode": {
                "enter": {
                  "text": {"field": "mut_to"},
                  "fill": {"value": "#000"},
                  // fontSize must be increased for gap character '-' to make it visible
                },
                "update": {
                  //center the text on x, y properties
                  "align": {"value": "center"},
                  "baseline": {"value": "middle"},
                  // Style the '-' and 'X' differently to make them equally visible
                  "fontWeight": {"signal": "datum.mut_to == \"-\" ? 'bold' : 'normal'"},
                  "font": {"signal": "datum.mut_to == \"-\" ? 'sans-serif' : 'monospace'"},
                  "fontSize": {"signal": "datum.mut_to == \"-\" ? clamp(mutation_mark_height*2, 0, mutation_mark_width*2) : clamp(mutation_mark_height*1.5, 0, mutation_mark_width*2)"},
                  "opacity": {"value": 0.9},
                  // Set opacity similar to this (but with indata and store data set of with hovered id) for hovered data for #24:
                  // [
                  //   {"test": "pts_tuple.id == null || datum.id == pts_tuple.id || datum.seq_id == 'inferred_naive'"", "value": 0.9},
                  //   {"value": 0.1}
                  // ],
                  "y": {"scale": "y", "field": "y"},
                  "x": {"scale": "x", "field": "position"},
                  "tooltip": {
                    "signal": "{\"position\": format(datum[\"position\"], \"\"), \"seq_id\": ''+datum[\"seq_id\"], \"mut_to\": ''+datum[\"mut_to\"], \"mut_from\": ''+datum[\"mut_from\"]}"
                  }
                }  
              },
            }
          ],
          // MUTATIONS AXES
          "axes": [
            // x
            {
              "scale": "x",
              "orient": "bottom",
              "grid": false,
              "title": "Amino acid position",
              "labelFlush": true,
              "labelOverlap": true,
              "tickCount": 128,
              "zindex": 1
            },
            // x grid
            {
              "scale": "x",
              "orient": "bottom",
              "gridScale": "y",
              "grid": true,
              "tickCount": 128,
              "domain": false,
              "labels": false,
              "maxExtent": 0,
              "minExtent": 0,
              "ticks": false,
              "zindex": 0
            },
            // y
            {
              "scale": "y",
              "orient": "left",
              "grid": false,
              "tickCount": {"signal": "leaves_count_incl_naive"},
              // TURN THIS ON TO DEBUG THE TICKS / GRID ISSUE
              "labels": false,
              "zindex": 1,
            },
            // y grid
            {
              "scale": "y",
              "orient": "left",
              "gridScale": "x",
              "grid": true,
              "tickCount": {"signal": "leaves_count_incl_naive"},
              // "domain": false,
              "labels": false,
              "maxExtent": 0,
              "minExtent": 0,
              "zindex": 0
            }
          ], 
          // Color legend
          "legends": [
            {
              "orient": "top",
              "direction": "horizontal",
              "fill": "naive_color",
              "title": "Gene region color key",
              "offset": {"signal": "2.5*mutation_mark_height"},
              "encode": {
                "symbols": {
                  "update": {"shape": {"value": "square"}, "opacity": {"value": 0.9}}
                }
              }
            }
          ],       
        }
      ],
      
      "scales": [     
        {
          "name": "naive_color",
          "type": "ordinal",
          "domain": [
            "V gene",
            "5' Insertion",
            "D gene",
            "3' Insertion",
            "J gene",
            "CDR3"
          ],
          // COLORS
          "range": [
            "#762a83",
            "#af8dc3",
            "black",
            "#d9f0d3",
            "#7fbf7b",
            "#1b7837"
          ]
        }, 
        {
          "name": "simple_color",
          "type": "ordinal",
          "range": {"scheme": "category20"}
        },
        {
          "name": "leaf_label_offset",
          "type": "linear",
          "domain": {"data": "leaves", "field": {"signal": "leaf_size_by"}},
          "range": [4,{"signal": "max_leaf_size/55"}]
        },
        {
          "name": "leaf_size_scale",
          "type": "linear",
          "domain": {"data": "leaves", "field": {"signal": "leaf_size_by"}},
          "range": [0,{"signal": "max_leaf_size"}]
        },
        {
          "name": "x",
          "type": "linear",
          "domain": {"data": "data_1", "field": "position"},
          "range": [5, {"signal": "width"}],
          "zero": true
        },
        {
          "name": "xscale",
          "type": "linear",
          "domain": {"signal": "xdom"},
          "range": {"signal": "xrange"},
          // "domain": {"data": "tree", "field": "x"},
          // "range": [0, {"signal": "scaledWidth"}],
          "nice": true,
          "zero": true
        },
        {
          // https://vega.github.io/vega/docs/scales/#quantize-scales
          "name": "y",
          "type": "quantize",
          // according to the above link,  "Using a number value for this parameter 
          //                               (representing a desired tick count) allows
          //                               greater control over the step size used to
          //                               extend the bounds, guaranteeing that the returned
          //                               ticks will exactly cover the domain."
          // This is not true in practice: why not?
          // "nice": {"signal": "leaves_len"},
          "zero": true,
          "domain": {"data": "leaves", "field": "y"},
          // this creates an array of range values - one for each leaf; height is heightScale * (len_leaves+1)
          "range": {"signal": "sequence(0, height, leaf_size)"}, 
        },
        {
          "name": "aa_color",
          "type": "ordinal",
          "domain": aminoAcidDomain,
          "range": tableau20plusColors
        }
      ],
      "legends": [
        {
          "orient": "right",
          "direction": "vertical",
          "fill": "aa_color",
          "title": "AA color",
          // "offset": {"signal": "2.5*mutation_mark_height"},
          "encode": {
            "symbols": {
              "update": {"shape": {"value": "square"}, "opacity": {"value": 0.9}}
            }
          }
        }
      ]     
    }
  )
}

const seqAlignSpec = (family) => {
  let padding = 20;
  let mutation_mark_height = 8
  // Add some height here for padding and to accomodate naive gene regions section
  let height = (family["lineage_seq_counter"]+2)*mutation_mark_height+padding;
  return(
    {
      "$schema": "https://vega.github.io/schema/vega/v4.json",
      "padding": 5,
      "height": height,
      "width": 1000,
      "style": "cell",
      "data": [
        {
          // This is for the naive gene regions shown 
          // at the top of the viz
          "name": "naive_data",
        },
        {
          // For showing the cdr3 with dotted lines in the alignment
          "name": "cdr3_bounds",
        },
        {
          "name": "source_0",
          "values": family["lineage_alignment"]
        },
        {
          "name": "data_0",
          "source": "source_0",
          "transform": [
            {
              "type": "formula",
              "expr": "toNumber(datum[\"position\"])",
              "as": "position"
            }
          ]
        },
        {
          "name": "x_and_gaps",
          "source": "data_0",
          "transform": [
              {
                "type": "filter",
                "expr": "datum.mut_to == \"-\" || datum.mut_to == \"X\""
              }
            ]
        }
      ],
      "signals": [
        {
          "name": "mutation_mark_height",
          "value": mutation_mark_height
        },
        {
          "name": "lineage_seqs",
          "value": family["lineage_seq_counter"]
        },
        {
          "name": "mark_width",
          "update": "ceil(width/150)"
        }
      ],
      "marks": [
        // Naive gene regions
        {
          "name": "naive",
          "type": "rect",
          "style": [
            "bar"
          ],
          "from": {
            "data": "naive_data"
          },
          "encode": {
            "update": {
              "fill": {"scale": "naive_color", "field": "region"},
              "tooltip": {
                "signal": "{\"region\": ''+datum[\"region\"], \"start\": format(datum[\"start\"], \"\"), \"end\": format(datum[\"end\"], \"\"),  \"gene\": ''+datum[\"gene\"]}"
              },
              "x": {
                "scale": "x",
                "signal": "floor(datum[\"start\"]/3)-0.5"
              },
              "x2": {
                "scale": "x",
                "signal": "floor(datum[\"end\"]/3)+0.5"
              },
              "yc":{"signal": "-1.5*mutation_mark_height"},
              "height": [
                {
                  "test": "datum[\"region\"] == 'CDR3'",
                  "signal": "mutation_mark_height*2"
                },
                {"signal": "mutation_mark_height"}      
            ],
            }
          }
        },
        // CDR3 bounds
        {
          "name": "rule_cdr3",
          "type": "rule",
          "from": {"data": "cdr3_bounds"},

          "encode": {
            "enter": {
              "stroke": {"value": "black"},
              "fill": {"value": "black"},
              "opacity": {"value": 0.6}
            },
            "update": {
              "x": {"scale": "x", "field": "x"},
              "y": {"signal": "-1*mutation_mark_height"},
              "y2": {"signal": "height"},
              "strokeWidth": {"value": 1},
              "strokeDash": {"value": [12,4]},
              "strokeCap": {"value": "butt"},
              "opacity": {"value": 1},
            }
          }
        },
        // Mutation marks
        {
          "name": "marks",
          "type": "rect",
          "style": ["tick"],
          "from": {"data": "data_0"},
          "encode": {
            "update": {
              "opacity": {"value": 0.9},
              "fill": [
                {
                  "test": "datum[\"position\"] === null || isNaN(datum[\"position\"])",
                  "value": null
                },
                {"scale": "aa_color", "field": "mut_to"}
              ],
              "tooltip": {
                "signal": "{\"position\": format(datum[\"position\"], \"\"), \"seq_id\": ''+datum[\"seq_id\"], \"mut_to\": ''+datum[\"mut_to\"], \"mut_from\": ''+datum[\"mut_from\"]}"
              },
              "xc": {"scale": "x", "field": "position"},
              "yc": {"scale": "y", "field": "seq_id"},
              "height": {"signal": "mutation_mark_height"},
              "width": {"signal": "mark_width"}
            }
          }
        },
        // Gap character labels
        {
          "name": "x_and_gap_labels",
          "type": "text",
          "from": {"data": "x_and_gaps"},
          "encode": {
            "enter": {
              "text": {"field": "mut_to"},
              "fill": {"value": "#000"},
            },
            "update": {
              "align": {"value": "center"},
              "baseline": {"value": "middle"},
              // Style the '-' and 'X' differently to make them equally visible
              "fontSize": {"signal": "datum.mut_to == \"-\" ? mutation_mark_height*2 : mutation_mark_height*1.5"},
              "fontWeight": {"signal": "datum.mut_to == \"-\" ? 'bold' : 'normal'"},
              "font": {"signal": "datum.mut_to == \"-\" ? 'sans-serif' : 'monospace'"},
              "opacity": {"value": 0.7},
              "y": {"scale": "y", "field": "seq_id"},
              "x": {"scale": "x", "field": "position"},
              "tooltip": {
                "signal": "{\"position\": format(datum[\"position\"], \"\"),  \"seq_id\": ''+datum[\"seq_id\"], \"mut_to\": ''+datum[\"mut_to\"], \"mut_from\": ''+datum[\"mut_from\"]}"
              }
            }  
          },
        }
      ],
      "scales": [
        {
          "name": "naive_color",
          "type": "ordinal",
          "domain": [
            "V gene",
            "5' Insertion",
            "D gene",
            "3' Insertion",
            "J gene",
            "CDR3"
          ],
          // COLORS
          "range": [
            "#762a83",
            "#af8dc3",
            "black",
            "#d9f0d3",
            "#7fbf7b",
            "#1b7837"
          ]
        }, 
        {
          "name": "x",
          "type": "linear",
          "domain": {"data": "data_0", "field": "position"},
          "range": [5, {"signal": "width"}],
          "nice": true,
          "zero": true
        },
        {
          "name": "y",
          "type": "point",
          "domain": {"data": "data_0", "field": "seq_id"},
          "range": [0, {"signal": "height"}],
          "padding": 0.5
        },
        {
          "name": "aa_color",
          "type": "ordinal",
          "domain": aminoAcidDomain,
          "range": tableau20plusColors
        }
      ],
      "axes": [
        {
          "scale": "x",
          "orient": "bottom",
          "grid": false,
          "title": "position",
          "labelFlush": true,
          "labelOverlap": true,
          "tickCount": {"signal": "ceil(width/40)"},
          "zindex": 1
        },
        {
          "scale": "x",
          "orient": "bottom",
          "gridScale": "y",
          "grid": true,
          "tickCount": 128,
          "domain": false,
          "labels": false,
          "maxExtent": 0,
          "minExtent": 0,
          "ticks": false,
          "zindex": 0
        },
        {
          "scale": "y",
          "orient": "left",
          "grid": false,
          "title": "seq id",
          "zindex": 1
        },
        {
          "scale": "y",
          "orient": "left",
          "gridScale": "x",
          "grid": true,
          "tickCount": 128,
          "domain": false,
          "labels": false,
          "maxExtent": 0,
          "minExtent": 0,
          "ticks": false,
          "zindex": 0
        },
      ],
      "legends": [
        {
          "orient": "top",
          "direction": "horizontal",
          "fill": "naive_color",
          "title": "Gene region color key",
          "offset": {"signal": "2.5*mutation_mark_height"},
          "encode": {
            "symbols": {
              "update": {"shape": {"value": "square"}, "opacity": {"value": 0.9}}
            }
          }
        },
        {
          "orient": "bottom",
          "direction": "horizontal",
          "fill": "aa_color",
          "title": "Amino acid color key:",
          "encode": {
            "symbols": {
              "update": {"shape": {"value": "square"}, "opacity": {"value": 0.7}}
            }
          }
        }
      ],
    }
  )
}

export {concatTreeWithAlignmentSpec, seqAlignSpec};
