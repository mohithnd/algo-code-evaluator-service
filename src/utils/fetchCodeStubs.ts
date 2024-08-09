import Problem from "../models/problem.model";

export default async function fetchCodeStubs(id: string, language: string) {
  try {
    const problem = await Problem.findById(id);
    if (!problem) {
      throw new Error("Problem Not Found");
    }

    const ans = {
      start: "",
      end: "",
    };

    ans.start = problem.codeStubs[0].startSnippet;
    ans.end = problem.codeStubs[0].endSnippet;

    console.log(language);

    return ans;
  } catch (err) {
    console.log(err);
    return null;
  }
}
