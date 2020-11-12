import React from "react";
import { Octokit } from "@octokit/rest";

import Repo from "./Repo";
import FilterButton from "./FilterButton";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      unreleased: true,
      dependabot_only: false,
      repos: [],
    };
  }

  componentDidMount() {
    this.loadRepos();
  }

  async loadRepos() {
    const octokit = new Octokit({
      auth: "token TOKEN",
    });

    let { data: repos } = await octokit.repos.listForUser({
      username: "mheap",
      per_page: 100,
      //per_page: 1,
    });

    console.log(repos);

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

        console.log(commits);
        repo.commits = commits;
        return repo;
      })
    );

    // Are they all authored by Dependabot?

    console.log(repos);
    this.setState({ repos });

    return;

    this.setState({
      repos: [
        {
          owner: "mheap",
          repo: "action-test",
          commits: 6,
          latest_release: "1.2.3",
          dependabot_only: true,
        },
        {
          owner: "mheap",
          repo: "demo",
          commits: 2,
          latest_release: "2.6.5",
          dependabot_only: false,
        },
        {
          owner: "mheap",
          repo: "foo",
          commits: 0,
          latest_release: "0.0.4",
          dependabot_only: false,
        },
        {
          owner: "mheap",
          repo: "other-thing",
          commits: 100,
          latest_release: "8.0.0",
          dependabot_only: false,
        },
        {
          owner: "mheap",
          repo: "no-release",
          commits: 100,
          latest_release: null,
          dependabot_only: false,
        },
      ],
    });
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
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderFilters()}
        <div className="flex flex-wrap my-4">
          {this.state.repos.map((r) => {
            if (!this.state.unreleased && r.latest_release === undefined) {
              return;
            }
            if (this.state.dependabot_only && !r.dependabot_only) {
              return;
            }
            return <Repo repo={r} key={r.full_name} />;
          })}
        </div>
      </div>
    );
  }
}

export default App;
