"use client";

import NumberFlow from "@number-flow/react";

const Counter = ({
	value,
	prefix = "",
	suffix = "",
}: {
	value: number | string;
	prefix?: string;
	suffix?: string;
}) => {
	return (
		<NumberFlow
			format={{ maximumFractionDigits: 6, minimumFractionDigits: 2 }}
			prefix={prefix}
			suffix={suffix}
			value={value}
		/>
	);
};
export default Counter;
