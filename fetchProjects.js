// TODO: Check rate limiting
// TODO: Pagination for columns? cards in columns?

const extractIssuesFromProject = require("./extractIssuesFromProject");

async function fetchProjects(octokit, user, cursor) {
  const results = await octokit.graphql(
    `
    query Projects($cursor: String, $user: String!) {
      user(login: $user) {
        projects(after: $cursor, first: 10) {
          nodes {
            name
            body
            state
            columns(first: 5) {
              nodes {
                name
                cards(first: 100) {
                  nodes {
                    isArchived
                    content {
                      ... on Issue {
                        number
                        title
                        body
                        state
                        repository {
                          name
                          owner {
                            login
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }

      `,
    {
      user,
      cursor,
    }
  );

  const hasNextPage = results.user.projects.pageInfo.hasNextPage;
  const endCursor = results.user.projects.pageInfo.endCursor;
  const projects = results.user.projects.nodes.map((node) => {
    return {
      name: node.name,
      body: node.body,
      state: node.state,
      issues: extractIssuesFromProject(node.columns),
    };
  });

  if (hasNextPage) {
    return projects.concat(await fetchProjects(octokit, user, endCursor));
  } else {
    return projects;
  }
}

module.exports = fetchProjects;
