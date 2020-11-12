import React from "react";

class Repo extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.repo;
  }

  styles() {
    let repo = this.state;
    let colour = "gray";
    if (repo.commits?.length >= 100) {
      colour = "red";
    }
    if (repo.dependabot_only) {
      colour = "green";
    }
    if (repo.latest_release === null) {
      colour = "orange";
    }

    return `bg-${colour}-500`;
  }

  renderDetails() {
    if (this.state.latest_release === undefined) {
      return "No release found";
    }

    if (this.state.commits === undefined) {
      return "Loading...";
    }

    return (
      <>
        <div>
          <p className="text-gray-700">Demo Text</p>
        </div>
        <div className="pt-4 pb-2">
          <span className="bg-gray-200 inline-block rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            Commits Ahead: {this.state.commits.ahead_by}
          </span>
          <span className="bg-gray-200 inline-block rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            Issues: {this.state.open_issues_count}
          </span>
          {this.state.latest_release && (
            <span className="bg-gray-200 inline-block rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
              Latest: {this.state.latest_release.tag_name}
            </span>
          )}
        </div>
      </>
    );
  }

  render() {
    return (
      <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 mb-4">
        <div className={this.styles() + " h-full px-6 py-4 mr-2 bg-gray-500"}>
          <div className="font-bold text-xl mb-2">
            <a href={this.state.html_url}>{this.state.full_name}</a>
          </div>
          {this.renderDetails()}
        </div>
      </div>
    );
  }
}

export default Repo;
