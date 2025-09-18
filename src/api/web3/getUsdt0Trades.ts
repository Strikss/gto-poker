import { Address, erc20Abi } from "viem";
import publicClient from "../../web3";
import { USER_ADDRESS, USTD0_ADDRESS } from "../../web3/addresses";
import { WEB3_KEYS } from "./keys";
import { useQuery } from "@tanstack/react-query";

//Due to rpc max range limit, using dummy data for now

export type GetUsdt0TradesResponse = {
	trades: {
		transactionHash: string;
		blockNumber: number;
		from?: Address;
		to?: Address;
		value: string;
		valueFormatted: number;
		isOutgoing: boolean;
		isIncoming: boolean;
	}[];
	total: number;
	userAddress: string;
	tokenAddress: string;
	blockRange: {
		from: number;
		to: number;
	};
};

const initialData: GetUsdt0TradesResponse = {
	trades: [
		{
			transactionHash: "0x1238",
			blockNumber: 123,
			from: "0x12512612621" as Address,
			to: "0x12512612621" as Address,
			value: "123",
			valueFormatted: 123,
			isOutgoing: true,
			isIncoming: false,
		},
		{
			transactionHash: "0x1237",
			blockNumber: 123,
			from: "0x125126211" as Address,
			to: "0x12512612621" as Address,
			value: "123",
			valueFormatted: 123,
			isOutgoing: true,
			isIncoming: false,
		},
		{
			transactionHash: "0x126",
			blockNumber: 123,
			from: "0x1sa2asd2612621" as Address,
			to: "0x12512612621" as Address,
			value: "123",
			valueFormatted: 123,
			isOutgoing: true,
			isIncoming: false,
		},
		{
			transactionHash: "0x1235",
			blockNumber: 123,
			from: "0x12512asdas2621" as Address,
			to: "0x12512sab12621" as Address,
			value: "123",
			valueFormatted: 123,
			isOutgoing: true,
			isIncoming: false,
		},
		{
			transactionHash: "0x1234",
			blockNumber: 123,
			from: "0x12512612621" as Address,
			to: "0x12512612621" as Address,
			value: "123",
			valueFormatted: 123,
			isOutgoing: true,
			isIncoming: false,
		},
		{
			transactionHash: "0x1232",
			blockNumber: 123,
			from: "0x125bloj12621",
			to: "0x12512612621",
			value: "123",
			valueFormatted: 123,
			isOutgoing: false,
			isIncoming: true,
		},
	],
	total: 0,
	userAddress: USER_ADDRESS,
	tokenAddress: USTD0_ADDRESS,
	blockRange: {
		from: 0,
		to: 0,
	},
};

async function getUsdt0Trades(address: Address) {
	const currentBlock = await publicClient.getBlockNumber();

	const fromBlock = currentBlock - 100n;

	const logs = await publicClient.getLogs({
		address: USTD0_ADDRESS,
		event: erc20Abi[1],
		args: {
			from: address,
		},
		fromBlock,
		toBlock: "latest",
	});

	const receivedLogs = await publicClient.getLogs({
		address: USTD0_ADDRESS,
		event: erc20Abi[1],
		args: {
			to: address,
		},
		fromBlock,
		toBlock: "latest",
	});

	const allLogs = [...logs, ...receivedLogs].sort(
		(a, b) => Number(b.blockNumber) - Number(a.blockNumber)
	);

	// Format the trades data
	const trades = allLogs.map((log) => ({
		transactionHash: log.transactionHash,
		blockNumber: Number(log.blockNumber),
		from: log.args.from,
		to: log.args.to,
		value: log.args.value?.toString() || "0",
		valueFormatted: Number(log.args.value || 0n) / Math.pow(10, 18),
		isOutgoing: log.args.from?.toLowerCase() === address.toLowerCase(),
		isIncoming: log.args.to?.toLowerCase() === address.toLowerCase(),
	}));

	if (trades.length === 0) {
		return initialData;
	}

	return {
		trades,
		total: allLogs.length,
		userAddress: address,
		tokenAddress: USTD0_ADDRESS,
		blockRange: {
			from: Number(fromBlock),
			to: Number(currentBlock),
		},
	};
}

const useGetUsdt0Trades = (address: Address, propData?: Awaited<ReturnType<typeof getUsdt0Trades>>) => {
	return useQuery({
		queryKey: [...WEB3_KEYS.USDT0_TRADES, address],
		queryFn: () => getUsdt0Trades(address),
		initialData: propData || initialData,
		refetchInterval: 10000,
		refetchOnMount: !propData,
	});
};

export { useGetUsdt0Trades, getUsdt0Trades };
