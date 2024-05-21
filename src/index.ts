import express, { Express } from "express";

import bullBoardAdapter from "./config/bullBoard.config";
import serverConfig from "./config/server.config";
import runCpp from "./containers/runCPPDocker";
import runJava from "./containers/runJavaDocker";
import runNodeJS from "./containers/runNodeJSDocker";
import runPython from "./containers/runPythonDocker";
import sampleQueueProducer from "./producers/sample.producer";
import apiRouter from "./routes";
import sampleWorker from "./workers/sample.worker";

const app: Express = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

app.use("/queues", bullBoardAdapter.getRouter());

app.listen(serverConfig.PORT, () => {
  console.log(`Server Is Running On Port: ${serverConfig.PORT}`);
  console.log(
    `BullBoard Dashboard Is Running On: http://localhost:${serverConfig.PORT}/queues`
  );

  sampleWorker("SampleQueue");

  let code = `n = int(input())
print("From Python")

for i in range(n):
  for j in range(i + 1):
    print("* ", end="")
  print()`;

  const inputCase = `4`;

  runPython(code, inputCase);

  code = `const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  readline.question("", (n) => {
    console.log("From Node.js");
  
    for (let i = 0; i < n; i++) {
      let row = "";
      for (let j = 0; j <= i; j++) {
        row += "* ";
      }
      console.log(row);
    }
  
    readline.close();
  });`;

  runNodeJS(code, inputCase);

  code = `import java.util.Scanner;

  public class Main {
      public static void main(String[] args) {
          Scanner scanner = new Scanner(System.in);
          int n = scanner.nextInt();
          scanner.close();
  
          System.out.println("From Java");
  
          for (int i = 0; i < n; i++) {
              for (int j = 0; j <= i; j++) {
                  System.out.print("* ");
              }
              System.out.println();
          }
      }
  }`;

  runJava(code, inputCase);

  code = `#include <iostream>
  using namespace std;
  
  int main()
  {
      int n;
      cin >> n;
      cout << "From C++" << endl;
      for (int i = 0; i < n; i++)
      {
          for (int j = 0; j <= i; j++)
          {
              cout << "* ";
          }
          cout << endl;
      }
      return 0;
  }`;

  runCpp(code, inputCase);

  sampleQueueProducer(
    "SampleJob",
    {
      name: "Sarthak",
      company: "Razorpay",
      position: "PM-2",
      location: "BLR",
    },
    2
  );
  sampleQueueProducer(
    "SampleJob",
    {
      name: "Sanket",
      company: "Microsoft",
      position: "SDE-2",
      location: "Remote",
    },
    1
  );
});
