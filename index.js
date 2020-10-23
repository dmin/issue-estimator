const core = require("@actions/core");
const github = require("@actions/github");
const fetchIssues = require("./fetchIssues");
const fetchProjects = require("./fetchProjects");
const processProject = require("./processProject");

async function run(token, user) {
  try {
    token = token || core.getInput("token");
    user = user || core.getInput("user");
    const octokit = github.getOctokit(token);

    return await main(octokit, user);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function main(octokit, user) {
  const issues = await fetchIssues(octokit, user);
  const projects = await fetchProjects(octokit, user);

  return projects.map(processProject.bind(null, issues));
}

run().then((projects) => {
  projects.forEach((project) => {
    console.log(`(${project.estimate}) ${project.name}`);
  });
});
