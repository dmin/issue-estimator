function extractIssuesFromProject(columns) {
  return columns.nodes.reduce((issues, column) => {
    const columnIssues = column.cards.nodes.map((card) => {
      const issue = card.content;
      return {
        number: `${issue.repository.owner.login}/${issue.repository.name}#${issue.number}`,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        userRepo: `${issue.repository.owner.login}/${issue.repository.name}`,
      };
    });

    return issues.concat(columnIssues);
  }, []);
}

module.exports = extractIssuesFromProject;
