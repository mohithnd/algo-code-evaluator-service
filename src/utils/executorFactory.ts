import CPPExecutor from "../executors/cppExecutor";
import JavaExecutor from "../executors/javaExecutor";
import NodeJSExecutor from "../executors/nodejsExecutor";
import PythonExecutor from "../executors/pythonExecutor";
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
