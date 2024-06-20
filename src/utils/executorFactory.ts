import CPPExecutor from "../containers/cppExecutor";
import JavaExecutor from "../containers/javaExecutor";
import NodeJSExecutor from "../containers/nodejsExecutor";
import PythonExecutor from "../containers/pythonExecutor";
import CodeExecutorStrategy from "../types/codeExecutorStrategy";

export default function createExecutor(
  language: string
): CodeExecutorStrategy | null {
  if (language === "CPP") {
    return new CPPExecutor();
  } else if (language === "JAVA") {
    return new JavaExecutor();
  } else if (language === "NODEJS") {
    return new NodeJSExecutor();
  } else if (language === "PYTHON") {
    return new PythonExecutor();
  } else {
    return null;
  }
}
