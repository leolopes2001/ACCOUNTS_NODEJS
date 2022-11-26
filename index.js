const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs");

const operation = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar Conta",
          "Consultar Saldo",
          "Depositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer.action;

      switch (action) {
        case "Criar Conta":
          createAccount();
          break;
        case "Consultar Saldo":
          checkBalance();
          break;
        case "Depositar":
          deposit();
          break;
        case "Sacar":
          withdraw();
          break;
        case "Sair":
          logout();
          break;
      }
    });
};

const removeMoney = (withdrawQuantity,accountName) => {
  const currentQuantity = Number(getAccount(accountName).balance);

  if (withdrawQuantity > currentQuantity) {
    console.log(
      chalk.bgRed.black("Saldo insuficiente para saque, digite outro valor!")
    );

    return handleWithdraw(accountName);
  }

  const newBalance = { balance: currentQuantity - withdrawQuantity };

  fs.writeFileSync(
    `./accounts/${accountName}.json`,
    JSON.stringify(newBalance),
    function (err) {
      console.log(err);
    }
  );

  console.log(
    chalk.bgGreen(`Saque de ${withdrawQuantity} foi realizado com sucesso!`)
  );

  operation();
};

const handleWithdraw = (accountName) => {
  inquirer
    .prompt([
      {
        name: "quantity",
        message: "Qual valor você deseja sacar?",
      },
    ])
    .then((answer) => {
      const withdrawQuantity = Number(answer.quantity);

      if (!withdrawQuantity) {
        console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente!"));
        return handleWithdraw(accountName);
      }

      removeMoney(withdrawQuantity, accountName);

      
    })
    .catch((err) => console.log(err));
};

const withdraw = () => {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer.accountName;

      if (!checkAccount(accountName)) {
        console.log(
          chalk.bgRed.black("Essa conta não existe, digite outro nome!")
        );
        return withdraw();
      }

      handleWithdraw(accountName);
    })
    .catch((err) => console.log(err));
};

const checkBalance = () => {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da usa conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer.accountName;

      if (!checkAccount(accountName)) {
        console.log(
          chalk.bgRed.black("Essa conta não existe, escolha outro nome!")
        );
        return checkBalance();
      }

      console.log(
        chalk.bgBlue.black(
          `O Saldo da sua conta é R$${getAccount(accountName).balance}!`
        )
      );

      operation();
    });
};

const logout = () => {
  console.log(chalk.bgBlue.black("Obrigado por usar o Accounts!"));
  process.exit();
};

const addAmout = (amout, accountName) => {
  const account = getAccount(accountName);

  const newAccountJSON = JSON.stringify({
    balance: Number(account.balance) + Number(amout),
  });

  fs.writeFileSync(
    `./accounts/${accountName}.json`,
    newAccountJSON,
    function (err) {
      console.log(err);
    }
  );

  console.log(
    chalk.green(`Foi depositado o valor de R$${amout} na sua conta!`)
  );
};

const getAccount = (accountName) => {
  const accountJSON = fs.readFileSync(`./accounts/${accountName}.json`, {
    encoding: "utf8",
    flag: "r",
  });

  return JSON.parse(accountJSON);
};

const deposit = () => {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qaul o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer.accountName;

      if (!checkAccount(accountName)) {
        console.log(
          chalk.bgRed.black("Essa conta não existe, escolha outro nome!")
        );
        return deposit();
      }

      inquirer
        .prompt([
          {
            name: "amout",
            message: "Quanto você deseja depositar?",
          },
        ])
        .then((answer) => {
          const amout = answer.amout;

          if (!amout) {
            console.log(
              chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!")
            );
            return operation();
          }

          addAmout(amout, accountName);

          operation();
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

const checkAccount = (accountName) => {
  return fs.existsSync(`./accounts/${accountName}.json`);
};

const buildAccount = () => {
  inquirer
    .prompt([
      {
        name: "accountName",
        type: "input",
        message: "Digite um nome para a sua conta:",
      },
    ])
    .then((answer) => {
      const accountName = answer.accountName;

      if (!checkAccount(accountName)) {
        console.log(chalk.bgRed("Esta conta ja existe, escolha outro nome!"));
        return buildAccount();
      }

      fs.writeFileSync(
        `./accounts/${accountName}.json`,
        '{"balance": 0}',
        function (err) {
          console.log(err);
        }
      );

      console.log(chalk.bgGreen("Parabéns, a sua conta foi criada!"));
      operation();
    });
};

const createAccount = () => {
  console.log(chalk.bgGreen.black("Parabéns por escolher o nosso banco!"));
  console.log(chalk.green("Defina as opções da conta a seguir"));

  if (!fs.existsSync) fs.mkdirSync("./accounts");

  buildAccount();
};
operation();
