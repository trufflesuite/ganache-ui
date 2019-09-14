import React from "react";
import LogoSvg from "../../icons/logo.svg";

class Logo extends React.Component {
  render() {
    const className = "Logo" + (this.props.fadeInElement ? " FadeInElement" : "")
    return (
        <div className="LogoWrapper">
            <div className={className}>
                <LogoSvg />
            </div>
        </div>
    );
  }
}

export default Logo;
