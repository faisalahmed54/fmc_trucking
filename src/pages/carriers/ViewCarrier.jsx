// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import SubHeader, {
	SubHeaderLeft,
	SubHeaderRight,
	SubheaderSeparator,
} from '../../layout/SubHeader/SubHeader';
import Page from '../../layout/Page/Page';
import { dashboardMenu, demoPages } from '../../menu';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../components/bootstrap/Card';
import { getFirstLetter, priceFormat } from '../../helpers/helpers';
import data from '../../common/data/dummyCustomerData';
import PaginationButtons, { dataPagination, PER_COUNT } from '../../components/PaginationButtons';
import Button from '../../components/bootstrap/Button';
import Icon from '../../components/icon/Icon';
import Input from '../../components/bootstrap/forms/Input';
import Dropdown, {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from '../../components/bootstrap/Dropdown';
import FormGroup from '../../components/bootstrap/forms/FormGroup';
import Checks, { ChecksGroup } from '../../components/bootstrap/forms/Checks';
import PAYMENTS from '../../common/data/enumPaymentMethod';
import useSortableData from '../../hooks/useSortableData';
import InputGroup, { InputGroupText } from '../../components/bootstrap/forms/InputGroup';
import Popovers from '../../components/bootstrap/Popovers';
import CustomerEditModal from './../presentation/crm/CustomerEditModal';
import { getColorNameWithIndex } from '../../common/data/enumColors';
import useDarkMode from '../../hooks/useDarkMode';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../components/bootstrap/Modal';
import { Label } from '../../components/icon/material-icons';
import Spinner from '../../components/bootstrap/Spinner';
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc } from 'firebase/firestore';
import { firestoredb } from '../../firebase';
import { toast } from 'react-toastify';
import showNotification from '../../components/extras/showNotification';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const ViewCarrier = () => {
	const navigate = useNavigate();
	//States
	const [customerPassword, setCustomerPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [customerName, setCustomerName] = useState('');
	const [customerEmail, setCustomerEmail] = useState('');
	const [customerMembership, setCustomerMembership] = useState('');
	const [addressLine1, setAddressLine1] = useState('');
	const [addressLine2, setAddressLine2] = useState('');
	const [city, setCity] = useState('');
	const [state, setState] = useState('');
	const [zip, setZip] = useState('');
	const [customerType, setCustomerType] = useState('');

	//Data from database
	const [carrierData, setcarrierData] = useState([]);
	const [count, setCount] = useState(0);

	const [isLoading, setIsLoading] = useState(false);

	const { darkModeStatus } = useDarkMode();

	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(PER_COUNT['10']);

	const formik = useFormik({
		initialValues: {
			customerName: customerName,
			searchInput: '',
			payment: Object.keys(PAYMENTS).map((i) => PAYMENTS[i].name),
			minPrice: '',
			maxPrice: '',
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		onSubmit: (values) => {
			// alert(JSON.stringify(values, null, 2));
		},
	});

	const filteredData = data.filter(
		(f) =>
			// Name
			f.name.toLowerCase().includes(formik.values.searchInput.toLowerCase()) &&
			// Price
			(formik.values.minPrice === '' || f.balance > Number(formik.values.minPrice)) &&
			(formik.values.maxPrice === '' || f.balance < Number(formik.values.maxPrice)) &&
			// Payment Type
			formik.values.payment.includes(f.payout),
	);

	const { items, requestSort, getClassNamesFor } = useSortableData(filteredData);

	const [editModalStatus, setEditModalStatus] = useState(false);

	function checkValidation() {
		if (!customerName || customerName == '') {
			return false;
		} else if (!customerPassword || customerPassword == '') {
			return false;
		} else if (!customerEmail || customerEmail == '') {
			return false;
		} else if (!customerMembership || customerMembership == '') {
			return false;
		} else if (!addressLine1 || addressLine1 == '') {
			return false;
		} else if (!addressLine2 || addressLine2 == '') {
			return false;
		} else if (!state || state == '') {
			return false;
		} else if (!zip || zip == '') {
			return false;
		}
		return true;
	}
	//Handlers

	const getCarrierData = async () => {
		const q = query(collection(firestoredb, 'Carriers'));
		const querySnapshot = await getDocs(q);
		if (querySnapshot.docs.length < 1) {
			console.log('No Data');
			setIsLoading(false);
		} else {
			setIsLoading(false);
			setcarrierData([]);
			querySnapshot.forEach((docRef) => {
				// doc.data() is never undefined for query doc snapshots
				console.log(docRef.id, ' => ', docRef.data());
				setcarrierData((prev) => [...prev, { id: docRef.id, data: docRef.data() }]);
				// console.log(carrierData);
			});
		}
	};
	useEffect(() => {
		setIsLoading(true);
		getCarrierData();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps
	useEffect(() => {
		console.log(carrierData);
	}, [carrierData]); // eslint-disable-line react-hooks/exhaustive-deps
	return (
		<PageWrapper title={demoPages.crm.subMenu.customersList.text}>
			<SubHeader>
				<SubHeaderLeft>
					<label
						className='border-0 bg-transparent cursor-pointer me-0'
						htmlFor='searchInput'>
						<Icon icon='Search' size='2x' color='primary' />
					</label>
					<Input
						id='searchInput'
						type='search'
						className='border-0 shadow-none bg-transparent'
						placeholder='Search customer...'
						onChange={formik.handleChange}
						value={formik.values.searchInput}
					/>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Dropdown>
						<DropdownToggle hasIcon={false}>
							<Button
								icon='FilterAlt'
								color='dark'
								isLight
								className='btn-only-icon position-relative'>
								{data.length !== filteredData.length && (
									<Popovers desc='Filtering applied' trigger='hover'>
										<span className='position-absolute top-0 start-100 translate-middle badge border border-light rounded-circle bg-danger p-2'>
											<span className='visually-hidden'>
												there is filtering
											</span>
										</span>
									</Popovers>
								)}
							</Button>
						</DropdownToggle>
						<DropdownMenu isAlignmentEnd size='lg'>
							<div className='container py-2'>
								<div className='row g-3'>
									<FormGroup label='Balance' className='col-12'>
										<InputGroup>
											<Input
												id='minPrice'
												ariaLabel='Minimum price'
												placeholder='Min.'
												onChange={formik.handleChange}
												value={formik.values.minPrice}
											/>
											<InputGroupText>to</InputGroupText>
											<Input
												id='maxPrice'
												ariaLabel='Maximum price'
												placeholder='Max.'
												onChange={formik.handleChange}
												value={formik.values.maxPrice}
											/>
										</InputGroup>
									</FormGroup>
									<FormGroup label='Payments' className='col-12'>
										<ChecksGroup>
											{Object.keys(PAYMENTS).map((payment) => (
												<Checks
													key={PAYMENTS[payment].name}
													id={PAYMENTS[payment].name}
													label={PAYMENTS[payment].name}
													name='payment'
													value={PAYMENTS[payment].name}
													onChange={formik.handleChange}
													checked={formik.values.payment.includes(
														PAYMENTS[payment].name,
													)}
												/>
											))}
										</ChecksGroup>
									</FormGroup>
								</div>
							</div>
						</DropdownMenu>
					</Dropdown>
					<SubheaderSeparator />
					<Button
						icon='PersonAdd'
						color='primary'
						isLight
						onClick={() => {
							navigate('/carriers/add-new-carrier');
						}}>
						Add New Carrier
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page>
				{isLoading && (
					<>
						<div className='loader'>
							<Spinner style={{ width: '50px', height: '50px' }} isGrow />
							<span style={{ fontSize: '20px' }}>Loading...</span>
						</div>
					</>
				)}
				<div className='row h-100'>
					<div className='col-12'>
						<Card stretch>
							<CardBody isScrollable className='table-responsive'>
								<table className='table table-modern table-hover'>
									<thead>
										<tr>
											<th>Name</th>
											<th>Address</th>
											<th>MC Number</th>
											<th>USDOT Number</th>
											<th>Primary Contact</th>
											<th>Primary Phone</th>
											<th>Primary Email</th>
											<th>Do not load</th>
											<th>1099 Vender</th>
											<th>Primary Insurance (BPID) Details</th>
											<th>Primary Insurance Expiration</th>
											<th>Cargo Insurance Details</th>
											<th>Cargo Insurance Expiration</th>
										</tr>
									</thead>
									<tbody>
										{carrierData &&
										carrierData !== undefined &&
										carrierData != null &&
										carrierData.length > 0 ? (
											dataPagination(carrierData, currentPage, perPage).map(
												(i) => (
													<tr key={i.id}>
														<td>{i.data.carrierName}</td>
														<td>{i.data.carrierAddress}</td>
														<td>{i.data.mcffmxNumber}</td>
														<td>{i.data.usdotNumber}</td>
														<td>{i.data.contactName}</td>
														<td>{i.data.telephone}</td>
														<td>{i.data.email}</td>
														<td>{i.data.doNotLoad}</td>
														<td>{i.data.vendor1099}</td>
														<td>{i.data.primaryInsuranceDetails}</td>
														<td>{i.data.primaryInsuranceExpiration}</td>
														<td>{i.data.cargoInsuranceDetails}</td>
														<td>{i.data.cargoInsuranceExpiration}</td>
														<td>
															<Dropdown>
																<DropdownToggle hasIcon={false}>
																	<Button
																		icon='MoreHoriz'
																		color='dark'
																		isLight
																		shadow='sm'
																	/>
																</DropdownToggle>
																<DropdownMenu isAlignmentEnd>
																	<DropdownItem>
																		<Button
																			icon='Visibility'
																			tag='a'
																			to={`../${dashboardMenu.carriers.subMenu.editCarrier.path}/${i.id}`}>
																			View
																		</Button>
																	</DropdownItem>
																</DropdownMenu>
															</Dropdown>
														</td>
													</tr>
												),
											)
										) : (
											<></>
										)}
									</tbody>
								</table>
							</CardBody>
							<PaginationButtons
								data={filteredData}
								label='carriers'
								setCurrentPage={setCurrentPage}
								currentPage={currentPage}
								perPage={perPage}
								setPerPage={setPerPage}
							/>
						</Card>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default ViewCarrier;
