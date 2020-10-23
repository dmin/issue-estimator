const calculateEstimate = require("./calculateEstimate");

function processProject(allIssues, project) {
  return {
    ...project,
    estimate: project.issues.reduce((sum, issue) => {
      return sum + calculateEstimate(issue, allIssues);
    }, 0),
  };
}

module.exports = processProject;
