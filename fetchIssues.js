// TODO: Check rate limiting

module.exports = async function fetchIssues(octokit, user, cursor) {
  const results = await octokit.graphql(
    `
        query Issues($cursor: String, $user: String!) {
          user(login: $user) {
            issues(after: $cursor, first: 100) {
              totalCount
              nodes {
                number
                title
                body
                state
                repository {
                  name
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

  const hasNextPage = results.user.issues.pageInfo.hasNextPage;
  const endCursor = results.user.issues.pageInfo.endCursor;
  const issues = results.user.issues.nodes.map((issue) => ({
    number: `${user}/${issue.repository.name}#${issue.number}`,
    title: issue.title,
    body: issue.body,
    state: issue.state,
    userRepo: `${user}/${issue.repository.name}`,
  }));

  if (hasNextPage) {
    return issues.concat(await fetchIssues(octokit, user, endCursor));
  } else {
    return issues;
  }
};
