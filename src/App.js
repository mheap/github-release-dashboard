import React from "react";
import { Octokit } from "@octokit/rest";

import Repo from "./Repo";
import FilterButton from "./FilterButton";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      unreleased: false,
      dependabot_only: false,
      zero_ahead: false,
      repos: [],
      authToken: null,
      targetUser: null,
    };
  }

  async loadRepos() {
    const octokit = new Octokit({
      auth: `token ${this.state.authToken}`,
    });

    let { data: repos } = await octokit.repos.listForUser({
      username: this.state.targetUser,
      per_page: 100,
      //per_page: 1,
    });

    // Remove archived repos
    repos = repos.filter((r) => !r.archived);

    this.setState({ repos });

    // Get the latest release
    repos = await Promise.all(
      repos.map(async (repo) => {
        const { data: release } = await octokit.repos.listReleases({
          owner: repo.owner.login,
          repo: repo.name,
          per_page: 1,
        });

        repo.latest_release = release[0];
        return repo;
      })
    );

    // Fetch the number of commits since that release
    repos = await Promise.all(
      repos.map(async (repo) => {
        if (!repo.latest_release) {
          return repo;
        }

        const { data: commits } = await octokit.repos.compareCommits({
          owner: repo.owner.login,
          repo: repo.name,
          base: repo.latest_release?.tag_name,
          head: repo.default_branch,
        });

        repo.commits = commits;
        return repo;
      })
    );

    // Are they all authored by Dependabot?
    repos = await Promise.all(
      repos.map(async (repo) => {
        if (!repo.commits || repo.commits.ahead_by === 0) {
          return repo;
        }

        const nonDependabot = repo.commits.commits.filter((c) => {
          return c.commit.author.login !== "dependabot[bot]";
        });

        repo.dependabot_only = true;
        if (nonDependabot.length > 0) {
          repo.dependabot_only = false;
        }

        return repo;
      })
    );

    this.setState({ repos });
  }

  invert(opt) {
    this.setState((state) => {
      state[opt] = !this.state[opt];
      return { ...state };
    });
  }

  renderFilters() {
    return (
      <div className="flex">
        <FilterButton
          defaultState={this.state.unreleased}
          onClick={() => this.invert("unreleased")}
        >
          Include Unreleased
        </FilterButton>
        <FilterButton
          defaultState={this.state.dependabot_only}
          onClick={() => this.invert("dependabot_only")}
        >
          Dependabot Only
        </FilterButton>
        <FilterButton
          defaultState={this.state.zero_ahead}
          onClick={() => this.invert("zero_ahead")}
        >
          Up to date
        </FilterButton>
      </div>
    );
  }

  handleSubmit(event) {
    this.setState(
      {
        authToken: event.target.elements.token.value,
        targetUser: event.target.elements.user.value,
      },
      () => {
        this.loadRepos();
      }
    );
    event.preventDefault();
  }

  renderTokenInput() {
    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <strong>
          This all runs in the browser. We never see your GitHub Access Token
          <br />
          <br />
        </strong>
        <label className="w-12 inline-block" htmlFor="token">
          Token:
        </label>
        <input
          className="ml-2 border-2"
          id="token"
          name="token"
          type="password"
        />
        <br />
        <label className="w-12 inline-block" htmlFor="user">
          User:
        </label>
        <input className="ml-2 border-2" id="user" name="user" />
        <br /> <br />
        <input
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          type="submit"
          value="Enter"
        />
      </form>
    );
  }

  render() {
    if (!this.state.authToken) {
      return this.renderTokenInput();
    }

    return (
      <div>
        {this.renderFilters()}
        <div className="flex flex-wrap my-4">
          {this.state.repos.map((r) => {
            if (!this.state.unreleased && r.latest_release === undefined) {
              return "";
            }
            if (this.state.dependabot_only && !r.dependabot_only) {
              return "";
            }
            if (
              !this.state.zero_ahead &&
              r.commits &&
              r.commits.ahead_by === 0
            ) {
              return "";
            }
            return <Repo repo={r} key={r.full_name} />;
          })}
        </div>
      </div>
    );
  }
}

export default App;
