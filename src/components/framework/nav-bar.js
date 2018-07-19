import React from "react";
// import PropTypes from 'prop-types';
import { connect } from "react-redux";
import Flex from "./flex";
import SidebarChevron from "./sidebar-chevron";
import { titleColors } from "../../util/globals";
import { darkGrey, brandColor, materialButton } from "../../globalStyles";
import { changePage } from "../../actions/navigation";

@connect((state) => {
  return {
    browserDimensions: state.browserDimensions.browserDimensions
  };
})
class NavBar extends React.Component {
  constructor(props) {
    super(props);
  }
  getStyles() {
    return {
      main: {
        maxWidth: 960,
        marginTop: "auto",
        marginRight: "auto",
        marginBottom: "auto",
        marginLeft: "auto",
        height: 50,
        justifyContent: "space-between",
        alignItems: "center",
        overflow: "hidden",
        left: 0,
        zIndex: 1001,
        transition: "left .3s ease-out"
      },
      logo: {
        paddingLeft: "8px",
        paddingRight: "8px",
        paddingTop: "20px",
        paddingBottom: "20px",
        color: "#000",
        cursor: "pointer",
        textDecoration: "none",
        fontSize: this.props.minified ? 12 : 16
      },
      title: {
        padding: "0px",
        color: "#000",
        textDecoration: "none",
        fontSize: 20,
        fontWeight: 400,
        cursor: "pointer"
      },
      link: {
        paddingLeft: this.props.minified ? "6px" : "12px",
        paddingRight: this.props.minified ? "6px" : "12px",
        paddingTop: "20px",
        paddingBottom: "20px",
        textDecoration: "none",
        cursor: "pointer",
        fontSize: this.props.minified ? 12 : 16,
        fontWeight: 400,
        textTransform: "uppercase"
      },
      inactive: {
        paddingLeft: this.props.minified ? "6px" : "12px",
        paddingRight: this.props.minified ? "6px" : "12px",
        paddingTop: "20px",
        paddingBottom: "20px",
        color: "#5097BA",
        textDecoration: "none",
        fontSize: this.props.minified ? 12 : 16,
        fontWeight: 400,
        textTransform: "uppercase"
      },
      alerts: {
        textAlign: "center",
        verticalAlign: "middle",
        width: 70,
        color: brandColor
      }
    };
  }

  getLogo(styles) {
    return (
      <a style={styles.logo}
        onClick={(e) => this.props.dispatch(changePage({path: "splash"})) }>
        <img alt="" width="40" src={require("../../images/nextstrain-logo-small.png")}/>
      </a>
    );
  }

  getLogoType(styles) {
    const title = "Olmsted";
    const rainbowTitle = title.split("").map((letter, i) =>
      <span key={i} style={{color: titleColors[i] }}>{letter}</span>
    );
    return (
      this.props.minified ?
        <div/>
        :
        <a style={styles.title}
          onClick={(e) => this.props.dispatch(changePage({path: "splash"})) }>
          {rainbowTitle}
        </a>
    );
  }

  getLink(name, path, styles) {
    const linkCol = this.props.minified ? "#000" : darkGrey;
    return (
      <a style={{ ...{color: linkCol}, ...styles.link }}
        onClick={(e) => this.props.dispatch(changePage({path: path})) }>
        {name}
      </a>
    );
  }

  getChevron() {
    return (
      this.props.minified ?
        <SidebarChevron
          mobileDisplay={this.props.mobileDisplay}
          handler={this.props.toggleHandler}
        />
        :
        <div/>
    );
  }

  render() {
    const styles = this.getStyles();
    return (
      <Flex style={styles.main}>
        {this.getLogo(styles)}
        {this.getLogoType(styles)}
        <div style={{flex: 5}}/>
        {this.getLink("About", "/about/overview/introduction", styles)}
        {this.getLink("Docs", "/docs/getting-started/install", styles)}
        {this.getLink("Blog", "/blog", styles)}
        {this.getChevron()}
        <div style={{width: this.props.minified ? 8 : 0 }}/>
      </Flex>
    );
  }
}

// include this as part of navbar when help page is complete on static
// {this.getLink("Help", "/help", styles)}

export default NavBar;
