const issueReference = " (?:([a-z-]+)\\/([a-z-]+))?#(\\d+)";

function extractDependencies(issue, allIssues) {
  try {
    const dependenciesText = extractDependenciesText(issue.body);

    if (!dependenciesText && !hasDependent) {
      throw new Error(
        `Issue ${issue.number}: Must list dependencies or the issue of which it is a dependency.`
      );
    }

    const [, ...splitDependencies] = dependenciesText.split(/- \[(?: |x)\]/g);

    const dependencies = splitDependencies.map(
      extractIssueNumber.bind(null, issue.userRepo)
    );

    validateIssuesExist(dependencies, allIssues, issue);

    return {
      ...issue,
      dependencies,
    };
  } catch (error) {
    if (error.message === "Missing issue reference") {
      throw new Error(
        `Issue ${issue.number}: Missing issue reference in list of dependencies.`
      );
    } else {
      throw error;
    }
  }
}

function validateIssuesExist(dependencies, allIssues, issue) {
  const missingIssues = findMissingIssues(dependencies, allIssues);

  if (missingIssues.length > 0) {
    throw new Error(
      `Issue ${
        issue.number
      }: The following issues listed as dependencies do not exist: ${missingIssues.join(
        ", "
      )}`
    );
  }
}

function findMissingIssues(dependencies, allIssues) {
  return dependencies.reduce((missingIssues, dependency) => {
    const exists = allIssues.some((issue) => issue.number === dependency);
    if (exists) {
      return missingIssues;
    } else {
      return missingIssues.concat(dependency);
    }
  }, []);
}

function extractIssueNumber(currentUserRepo, dependencyText) {
  const match = dependencyText.match(new RegExp(issueReference));

  if (match) {
    const user = match[1];
    const repo = match[2];
    const number = match[3];

    const prefix = user && repo ? user + "/" + repo : currentUserRepo;
    return prefix + "#" + number;
  } else {
    throw new Error("Missing issue reference");
  }
}

function extractDependenciesText(body) {
  const match = body.match(/^Dependencies:\s((?:.|\s)+)(?=(?:^$)|$)/m);

  if (match) {
    return match[1];
  } else {
    return "";
  }
}

function hasDependent(body) {
  return body.match(new RegExp("Dependency of" + issueReference));
}

// function test() {
//   const issue = {
//     number: "dmin/reckon-web#22",
//     userRepo: "dmin/reckon-web",
//     body: "Dependencies:\n- [ ] Exists #22\n- [ ] Does not exist #00",
//   };

//   const allIssues = [{ number: "dmin/reckon-web#22", body: "Hello" }];

//   return extractDependencies(issue, allIssues);
// }

// console.log(test());

module.exports = extractDependencies;
