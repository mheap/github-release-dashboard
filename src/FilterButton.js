import React from "react";

class FilterButton extends React.Component {
  state = {
    active: this.props.defaultState || false,
  };

  handleClick() {
    this.setState({ active: !this.state.active });
    this.props.onClick();
    return false;
  }

  render() {
    let disabled = "bg-transparent text-blue-700 border-blue-500";
    let enabled = "bg-blue-500 text-white border-transparent";

    if (!this.state.active) {
      [disabled, enabled] = [enabled, disabled];
    }
    return (
      <button
        className={`${enabled} ${disabled
          .split(" ")
          .map((h) => `hover:${h}`)
          .join(" ")} font-semibold py-2 px-4 border rounded mr-2`}
        onClick={this.handleClick.bind(this)}
      >
        {this.props.children}
      </button>
    );
  }
}

export default FilterButton;
