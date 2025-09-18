import { chainSpecificInfo } from "@/web3/chainSpecificData";
import publicClient from "../../web3";

import { Address } from "viem";
import { WEB3_KEYS } from "./keys";
import { useQuery } from "@tanstack/react-query";

const initialData = { balance: "0", ticker: "HYPE" };

async function getGasBalance(address: Address) {
	const balance = await publicClient.getBalance({
		address,
	});

	const balanceInTokens = chainSpecificInfo.defaultFormatter(balance);

	return {
		ticker: "HYPE",
		balance: balanceInTokens,
	};
}

const useGetGasBalance = (address: Address, propData?: Awaited<ReturnType<typeof getGasBalance>>) => {
	return useQuery({
		queryKey: [...WEB3_KEYS.HYPER_BALANCE, address],
		queryFn: () => getGasBalance(address),
		initialData: propData || initialData,
		refetchInterval: 10000,
		refetchOnMount: !propData,
	});
};

export { useGetGasBalance, getGasBalance };
