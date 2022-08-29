import * as React from 'react';

function SvgLightbulbOff(props) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width='1em'
			height='1em'
			fill='currentColor'
			className='svg-icon'
			viewBox='0 0 16 16'
			{...props}>
			<path
				fillRule='evenodd'
				d='M2.23 4.35A6.004 6.004 0 002 6c0 1.691.7 3.22 1.826 4.31.203.196.359.4.453.619l.762 1.769A.5.5 0 005.5 13a.5.5 0 000 1 .5.5 0 000 1l.224.447a1 1 0 00.894.553h2.764a1 1 0 00.894-.553L10.5 15a.5.5 0 000-1 .5.5 0 000-1 .5.5 0 00.288-.091L9.878 12H5.83l-.632-1.467a2.954 2.954 0 00-.676-.941 4.984 4.984 0 01-1.455-4.405l-.837-.836zm1.588-2.653l.708.707a5 5 0 017.07 7.07l.707.707a6 6 0 00-8.484-8.484zm-2.172-.051a.5.5 0 01.708 0l12 12a.5.5 0 01-.708.708l-12-12a.5.5 0 010-.708z'
			/>
		</svg>
	);
}

export default SvgLightbulbOff;
