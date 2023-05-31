import { List } from 'antd';
import React from 'react';
import { TokenCard } from '../token-card/token-card';

export const TokenGrid = React.memo(function TokenGrid({
	rents,
	// onLoadNFT,
	onClickRent,
	style,
}) {
	return (
		<div style={style}>
			<List
				grid={{
					gutter: 24,
					column: 4,
					xs: 1,
					sm: 1,
					md: 2,
					lg: 3,
					xl: 4,
					xxl: 4,
				}}
				dataSource={rents}
				rowKey={(item) => item.tokenId}
				renderItem={(item) => {
					return (
            <List.Item
              style={{ marginBottom: 24 }}
              onClick={() => onClickRent(item)}
            >
              <TokenCard agreement={item} />
            </List.Item>
          );
				}}
				locale={{ emptyText: <div></div> }}
			/>

			<style jsx>{``}</style>
		</div>
	);
});
