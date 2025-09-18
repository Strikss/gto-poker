import { Address, erc20Abi } from "viem";
import publicClient from "@/web3";
import { USTD0_ADDRESS } from "@/web3/addresses";
import { chainSpecificInfo } from "@/web3/chainSpecificData";
import { WEB3_KEYS } from "./keys";
import { useQuery } from "@tanstack/react-query";

const initialData = { balance: "0", ticker: "USDT0" };

async function getUsdt0Balance(address: `0x${string}`) {
	const balance = await publicClient.readContract({
		address: USTD0_ADDRESS,
		abi: erc20Abi,
		functionName: "balanceOf",
		args: [address],
	});

	const balanceInTokens = chainSpecificInfo.defaultFormatter(balance, 6);

	return {
		ticker: "USDT0",
		balance: balanceInTokens,
	};
}
const useGetUsdt0Balance = (
	address: Address,
	propData?: Awaited<ReturnType<typeof getUsdt0Balance>>
) => {
	return useQuery({
		queryKey: [...WEB3_KEYS.USDT0_BALANCE, address],
		queryFn: () => getUsdt0Balance(address),
		initialData: propData || initialData,
		refetchInterval: 10000,
		refetchOnMount: !propData,
	});
};

export { useGetUsdt0Balance, getUsdt0Balance };
