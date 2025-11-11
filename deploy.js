import { ethers } from "ethers";
import fs from "fs-extra";
import dotenv from "dotenv";
dotenv.config();

async function main() {
	const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
	const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
	const nonce = await provider.getTransactionCount(wallet.address, "latest");

	const abi = fs.readFileSync("SimpleStorage_sol_SimpleStorage.abi", "utf8");
	const binary = fs.readFileSync(
		"SimpleStorage_sol_SimpleStorage.bin",
		"utf8",
	);

	const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
	console.log("deploying, please wait");

	// Deploy with gas limit
	const contract = await contractFactory.deploy();
	await contract.deploymentTransaction().wait(1);
	console.log(`contract deployed at address: ${contract.target}`);
	const cfn = await contract.retrieve();
	console.log(`current fav number : ${cfn.toString()}`);

	//Store a new value
	const transactionResponse = await contract.store("7");
	await transactionResponse.wait(1);
	const updatedCfn = await contract.retrieve(); //current fav number
	console.log(`updated cfn : ${updatedCfn.toString()}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
