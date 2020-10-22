const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    const token = core.getInput("token");
    const user = core.getInput("user");
    const octokit = github.getOctokit(token);

    // TODO: Support pagination of issues / projects
    // TODO: Combine queries?

    const reckonAPI = await octokit.graphql(
      `
        query Issues($user: String!) {
          repository(name: "reckon-api", owner: $user) {
            name
            issues(first:100, states: OPEN) {
              edges {
                node {
                  number
                  title
                  body
                }
              }
            }
          }
        }
      `,
      {
        user,
      }
    );

    console.log("Issues in Reckon API:");
    reckonAPI.repository.issues.edges.forEach((edge) => {
      console.log(edge.node.title);
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
