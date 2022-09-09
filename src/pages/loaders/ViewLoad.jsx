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
import { demoPages, dashboardMenu } from '../../menu';
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
import CustomerEditModal from '../presentation/crm/CustomerEditModal';
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

const ViewLoad = () => {
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
	const [loaderData, setLoaderData] = useState([]);
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

	const getLoaderData = async () => {
		setIsLoading(true);
		const q = query(collection(firestoredb, 'Loaders'));
		const querySnapshot = await getDocs(q);
		if (querySnapshot.docs.length < 1) {
			console.log('No Data');
		} else {
			setLoaderData([]);
			querySnapshot.forEach((docRef) => {
				// doc.data() is never undefined for query doc snapshots
				console.log(docRef.id, ' => ', docRef.data());
				setLoaderData((prev) => [...prev, { id: docRef.id, data: docRef.data() }]);
				setIsLoading(false);

				// console.log(loaderData);
			});
		}
	};
	const addNewCustomer = async () => {
		if (!checkValidation()) {
			showNotification(
				<span className='d-flex align-items-center'>
					<Icon icon='Info' size='lg' className='me-1' />
					<span>Error!</span>
				</span>,
				'All Fields are mandatory',
			);
		} else {
			setIsLoading(true);
			const docRef = doc(firestoredb, 'customers', customerEmail);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				setIsLoading(false);
				console.log('Document data:', docSnap.data());
				showNotification(
					<span className='d-flex align-items-center'>
						<Icon icon='Info' size='lg' className='me-1' />
						<span>Alert!</span>
					</span>,
					'Customer Already Existed !',
				);
			} else {
				// doc.data() will be undefined in this case
				console.log('No such document!');
				await setDoc(doc(firestoredb, 'customers', customerEmail), {
					name: customerName,
					customerPassword: customerPassword,
					customerEmail: customerEmail,
					customerMembership: customerMembership,
					addressLine1: addressLine1,
					addressLine2: addressLine2,
					state: state,
					zip: zip,
					type: customerType,
				})
					.then((resp) => {
						console.log(resp);
						setIsLoading(false);
						setEditModalStatus(false);
						showNotification(
							<span className='d-flex align-items-center'>
								<Icon icon='Info' size='lg' className='me-1' />
								<span>Success!</span>
							</span>,
							'Customer Added Successfully!',
						);
						getLoaderData();
					})
					.catch((error) => {
						console.log(error);
					});
			}
		}
	};
	useEffect(() => {
		getLoaderData();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps
	useEffect(() => {
		console.log(loaderData);
	}, [loaderData]); // eslint-disable-line react-hooks/exhaustive-deps
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
							navigate('/loads/add-load');
						}}>
						New Loader
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
											<th>Load Status</th>
											<th>Customer</th>
											<th>Carrier</th>
											<th>Driver</th>
											<th>Equipment</th>
											<th>Power Unit</th>
											<th>Trailer</th>
											<th>Distance</th>
											<th>Weight</th>
											<th>Reference</th>
											<th>Truck Status</th>
											<th>Branch</th>
											<th>Container</th>
											<th>Last free day</th>
										</tr>
									</thead>
									<tbody>
										{loaderData &&
										loaderData !== undefined &&
										loaderData != null &&
										loaderData.length > 0 ? (
											dataPagination(loaderData, currentPage, perPage).map(
												(i) => (
													<tr key={i.id}>
														<td>{i.data.loadInformation.loadStatus}</td>
														<td>
															{i.data.customerInformation.getCustomer}
														</td>
														<td>
															{
																i.data.carrierInformation
																	.getCarrierCustomer
															}
														</td>
														<td>
															{
																i.data.carrierInformation
																	.carrierDriver
															}
														</td>
														<td>
															{i.data.loadInformation.equipmentType}

															{/* <div>
																{i.data.customerMembership &&
																i.data.customerMembership !== '' ? (
																	moment(
																		i.data.customerMembership,
																	).format('ll')
																) : (
																	<></>
																)}
															</div> */}
														</td>

														<td>
															{i.data.carrierInformation.getPowerUnit}
														</td>
														<td>
															{i.data.carrierInformation.getTrailer}
														</td>
														<td>{i.data.loadInformation.weight}</td>
														<td>{i.data.zip}</td>
														<td>
															{i.data.loadInformation.loadReference}
														</td>
														<td>
															{i.data.loadInformation.truckStatus}
														</td>
														<td>
															{i.data.loadInformation.loaderBranch}
														</td>
														<td>{i.data.zip}</td>
														<td>
															{' '}
															<div>
																{i.data.loadInformation &&
																i.data.loadInformation !== '' ? (
																	moment(
																		i.data.loadInformation
																			.lastFreeDay,
																	).format('ll')
																) : (
																	<></>
																)}
															</div>
														</td>
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
																			to={`../${dashboardMenu.loads.subMenu.editLoad.path}/${i.id}`}>
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
								label='customers'
								setCurrentPage={setCurrentPage}
								currentPage={currentPage}
								perPage={perPage}
								setPerPage={setPerPage}
							/>
						</Card>
					</div>
				</div>
			</Page>
			<Modal isOpen={editModalStatus} setIsOpen={setEditModalStatus} size='xl'>
				<ModalHeader setIsOpen={setEditModalStatus} className='p-4'>
					<ModalTitle>New Customer</ModalTitle>
				</ModalHeader>
				<ModalBody className='px-4'>
					<div className='row g-4'>
						<FormGroup id='customerName' label='Name' className='col-md-6'>
							<Input
								isTouched={formik.touched.customerName}
								invalidFeedback={formik.errors.customerName}
								validFeedback='HEllo'
								isValid={formik.isValid}
								placeholder='Name'
								onChange={(e) => {
									setCustomerName(e.target.value);
								}}
								value={customerName}
							/>
						</FormGroup>
						<FormGroup id='email' label='Email' className='col-md-6'>
							<Input
								type='email'
								placeholder='Email'
								onChange={(e) => {
									setCustomerEmail(e.target.value);
								}}
								value={customerEmail}
							/>
						</FormGroup>
						<FormGroup id='password' label='Password' className='col-md-6'>
							<Input
								placeholder='Password '
								type='password'
								onChange={(e) => {
									setCustomerPassword(e.target.value);
								}}
								value={customerPassword}
							/>
						</FormGroup>
						{/* <FormGroup
							id='confirmPassword'
							label='Confirm Password'
							className='col-md-6'>
							<Input
								type='email'
								invalidFeedback='Yes'
								pattern={customerPassword}
								onChange={(e) => {
									if (!e.target.validity.valid) {
										
									}
								}}
								value={confirmPassword}
							/>
						</FormGroup> */}
						<FormGroup id='membershipDate' label='Membership' className='col-md-6'>
							<Input
								type='date'
								onChange={(e) => {
									setCustomerMembership(e.target.value);
								}}
								value={customerMembership}
							/>
						</FormGroup>
						<FormGroup id='type' label='Type' className='col-md-6'>
							<Input
								placeholder='Type'
								onChange={(e) => {
									setCustomerType(e.target.value);
								}}
								value={customerType}
							/>
						</FormGroup>

						<div className='col-md-6'>
							<Card className='rounded-1 mb-0'>
								<CardHeader>
									<CardLabel icon='ReceiptLong'>
										<CardTitle>Billing Address</CardTitle>
									</CardLabel>
								</CardHeader>
								<CardBody>
									<div className='row g-3'>
										<FormGroup
											id='streetAddress'
											label='Address Line'
											className='col-12'>
											<Input
												onChange={(e) => {
													setAddressLine1(e.target.value);
												}}
												value={addressLine1}
											/>
										</FormGroup>
										<FormGroup
											id='streetAddress2'
											placeholder='Address Line 2'
											label='Address Line 2'
											className='col-12'>
											<Input
												onChange={(e) => {
													setAddressLine2(e.target.value);
												}}
												value={addressLine2}
											/>
										</FormGroup>
										<FormGroup id='city' label='City' className='col-md-4'>
											<Input
												onChange={(e) => {
													setCity(e.target.value);
												}}
												value={city}
											/>
										</FormGroup>
										<FormGroup
											id='stateFull'
											label='State'
											className='col-md-4'>
											<Input
												onChange={(e) => {
													setState(e.target.value);
												}}
												value={state}
											/>
										</FormGroup>
										<FormGroup id='zip' label='Zip' className='col-md-4'>
											<Input
												onChange={(e) => {
													setZip(e.target.value);
												}}
												value={zip}
											/>
										</FormGroup>
									</div>
								</CardBody>
							</Card>
						</div>
					</div>
				</ModalBody>
				<ModalFooter className='px-4 pb-4'>
					<Button color='info' onClick={addNewCustomer}>
						{' '}
						{isLoading && <Spinner isSmall inButton isGrow />}
						Save
					</Button>
				</ModalFooter>
			</Modal>
			{/* <CustomerEditModal setIsOpen={setEditModalStatus} isOpen={editModalStatus} id='0' /> */}
		</PageWrapper>
	);
};

export default ViewLoad;
