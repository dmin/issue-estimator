const extractDependencies = require("./extractDependencies");
const extractEstimate = require("./extractEstimate");

function calculateEstimate(issue, allIssues) {
  // console.log(`Calculating estimate for: ${issue.number}`);
  const enhancedIssue = extractEstimate(extractDependencies(issue, allIssues));
  // if (enhancedIssue.dependencies.length > 0) {
  //   console.log(`Calculating estimate for dependencies of: ${issue.number}`);
  //   console.log("Dependencies: ", enhancedIssue.dependencies);
  // }
  const estimateOfDependencies = enhancedIssue.dependencies.reduce(
    (sum, dependency) => {
      childIssue = allIssues.find((i) => i.number === dependency);
      return sum + calculateEstimate(childIssue, allIssues);
    },
    0
  );

  return enhancedIssue.estimate + estimateOfDependencies;
}

module.exports = calculateEstimate;
