# DailyPlanner Smart Contract

This Solidity program is a simple DailyPlanner contract that demonstrates the basic syntax and functionality of the Solidity programming language. The purpose of this program is to serve as a starting point for those who are new to Solidity and want to get a feel for how it works.

## Description

This program is a basic DailyPlanner contract written in Solidity, a programming language used for developing smart contracts on the Ethereum blockchain. The contract includes functionalities such as addTask, getTask , updateTask and updateTaskStatus. This program serves as a simple and straightforward introduction to Solidity programming and can be used as a stepping stone for more complex projects in the future.

In this smart contract we also implements the require(), assert() and revert() statements.

We are also going to use react and web3 to connect our blockchain to frontend.


## Usage/Examples

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract DailyPlanner {

    struct Task {
        string task; //task desc
        uint deadline;
        bool isCompleted;
        bool deadlineUpdated; //ddmmyyyy
    }

    mapping(address => Task[]) private userTasks;

    event TaskAdded(address indexed user, uint taskIndex, string task, uint deadline);
    event TaskStatusUpdated(address indexed user, uint taskIndex, bool isCompleted);
    event TaskDeadlineUpdated(address indexed user, uint taskIndex, uint newDeadline);

    function addTask(string memory _task, uint _deadline) public {
        if (bytes(_task).length == 0) {
            revert("task description cannot be empty");
        }
        userTasks[msg.sender].push(Task({
            task: _task,
            deadline: _deadline,
            isCompleted: false,
            deadlineUpdated: false
        }));
        
        uint taskIndex = userTasks[msg.sender].length - 1;
        emit TaskAdded(msg.sender, taskIndex, _task, _deadline);
    }

    function updateTaskStatus(uint _taskIndex, bool _isCompleted) public {
        assert(_taskIndex < userTasks[msg.sender].length);

        userTasks[msg.sender][_taskIndex].isCompleted = _isCompleted;
        emit TaskStatusUpdated(msg.sender, _taskIndex, _isCompleted);
    }

    function updateTaskDeadline(uint _taskIndex, uint _newDeadline) public {
        require(_taskIndex < userTasks[msg.sender].length, "Task index out of bounds");
        require(!userTasks[msg.sender][_taskIndex].deadlineUpdated, "Deadline already updated once");

        userTasks[msg.sender][_taskIndex].deadline = _newDeadline;
        userTasks[msg.sender][_taskIndex].deadlineUpdated = true;
        
        emit TaskDeadlineUpdated(msg.sender, _taskIndex, _newDeadline);
    }

    function getTasks() public view returns (Task[] memory) {
        return userTasks[msg.sender];
    }
}

```


## Run Locally

Clone the project

```bash
  git clone https://github.com/Ayush-dvplr/intermediate_eth_ass2.git
```

Go to the project directory

```bash
  cd intermediate_eth_ass2
```

Go to the blockchain directory

```bash
  cd blockchain
```

Install dependencies

```bash
  npm install
```

Go to the frontend directory from another terminal

```bash
  cd frontend
```

Install dependencies

```bash
  npm install
```

Start the blockchain node from terminal which is in blockchain directory

```bash
  npx hardhat node
```

Start one more terminal in blockchain directory

```bash
  npx hardhat run --network localhost scripts/deploy.js
```

Start frontend from the terminalin frontend directory

```bash
  npm start
```
## Screenshots

![App Screenshot](https://res.cloudinary.com/dsprifizw/image/upload/v1719985348/homev2.png)

![App Screenshot](https://res.cloudinary.com/dsprifizw/image/upload/v1719985466/createv2.png)

![App Screenshot](https://res.cloudinary.com/dsprifizw/image/upload/v1719985686/editv2.png)


## Lessons Learned

- Integrate Solidity contracts with React using Hardhat and ensure ABI compatibility

- Use Hardhat for local blockchain development to speed up testing and deployment

- Utilize React hooks like useState and useEffect for efficient state management and handling blockchain interactions

- Gas Efficiency: Understanding gas implications of error handling helps design more efficient contracts.

- Design smart contracts to minimize gas costs and ensure reliable data storage and retrieval


## Author

- Ayush sah[@linkedin](https://www.linkedin.com/in/ayushsah404/)

