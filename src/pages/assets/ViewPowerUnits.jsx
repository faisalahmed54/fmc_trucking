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
import { demoPages } from '../../menu';
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
import Textarea from '../../components/bootstrap/forms/Textarea';
import Option from '../../components/bootstrap/Option';
import Select from '../../components/bootstrap/forms/Select';

const ViewPowerUnits = () => {
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
	const [creditLimit, setcreditLimit] = useState('');
	const [avaliableCredit, setavaliableCredit] = useState('');
	const [mcNumber, setmcNumber] = useState('');
	const [usDotNumber, setusDotNumber] = useState('');
	const [Fax, setFax] = useState('');
	const [telephone, settelephone] = useState('');

	//Asset States
	const [makeModel, setmakeModel] = useState('');
	const [powerUnitNumber, setpowerUnitNumber] = useState('');
	const [engineType, setengineType] = useState('');
	const [transmissionType, settransmissionType] = useState('');
	const [fuelType, setfuelType] = useState('');
	const [horsepower, sethorsepower] = useState('');
	const [licensePlate, setlicensePlate] = useState('');
	const [modelYear, setmodelYear] = useState('');
	const [vehicleIdNumber, setvehicleIdNumber] = useState('');
	const [assetstatus, setassetstatus] = useState('');
	const [insuranceInformation, setinsuranceInformation] = useState('');
	const [registeredStates, setregisteredStates] = useState('');
	const [assetLength, setassetLength] = useState('');
	const [assetWidth, setassetWidth] = useState('');
	const [assetHeight, setassetHeight] = useState('');
	const [numberOfAxles, setnumberOfAxles] = useState('');
	const [unloadedVehicleWeight, setunloadedVehicleWeight] = useState('');
	const [grossVehicleWeight, setgrossVehicleWeight] = useState('');
	const [notes, setnotes] = useState('');
	const [ownership, setownership] = useState('');

	//Data from database
	const [customerData, setCustomerData] = useState([]);
	const [count, setCount] = useState(0);

	const [editedCustomerId, setEditedCustomerId] = useState(false);
	const [isEditingCustomer, setIsEditingCustomer] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(false);

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

	const getCustomerData = async () => {
		const q = query(collection(firestoredb, 'customers'));
		const querySnapshot = await getDocs(q);
		if (querySnapshot.docs.length < 1) {
			console.log('No Data');
			setIsLoadingData(false);
		} else {
			setCustomerData([]);
			querySnapshot.forEach((docRef) => {
				// doc.data() is never undefined for query doc snapshots
				// console.log(docRef.id, ' => ', docRef.data());
				setCustomerData((prev) => [...prev, { id: docRef.id, data: docRef.data() }]);
				// console.log(customerData);
			});
			setIsLoadingData(false);
		}
	};
	function setCustomerDataInModal(custData) {
		if (custData == [] || custData == '' || custData == undefined || !custData) {
			setCustomerName('');
			setCustomerPassword('');
			setCustomerEmail('');
			setCustomerMembership('');
			setAddressLine1('');
			setAddressLine2('');
			setCity('');
			setState('');
			setZip('');
			setCustomerType('');
			setcreditLimit('');
			setavaliableCredit('');
			setmcNumber('');
			setusDotNumber('');
			setFax('');
			settelephone('');
			setnotes('');
		} else {
			setCustomerName(custData.name);
			setCustomerPassword(custData.customerPassword);
			setCustomerEmail(custData.customerEmail);
			setCustomerMembership(custData.customerMembership);
			setAddressLine1(custData.addressLine1);
			setAddressLine2(custData.addressLine2);
			setCity(custData.city);
			setState(custData.state);
			setZip(custData.zip);
			setCustomerType(custData.type);
			setcreditLimit(custData.creditLimit);
			setavaliableCredit(custData.avaliableCredit);
			setmcNumber(custData.mcNumber);
			setusDotNumber(custData.usDotNumber);
			setFax(custData.Fax);
			settelephone(custData.telephone);
			setnotes(custData.notes);
		}
		setIsLoadingData(false);
	}
	const getCustomerDataWithId = async (customerId) => {
		// console.log(result[4]);
		const docRef = doc(firestoredb, 'customers', customerId);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			console.log('Document data:', docSnap.data());
			setCustomerDataInModal(docSnap.data());
		} else {
			// doc.data() will be undefined in this case
			console.log('No such document!');
			setIsLoadingData(false);
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
					city: city,
					zip: zip,
					type: customerType,
					creditLimit: creditLimit,
					avaliableCredit: avaliableCredit,
					mcNumber: mcNumber,
					usDotNumber: usDotNumber,
					Fax: Fax,
					telephone: telephone,
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
						getCustomerData();
					})
					.catch((error) => {
						console.log(error);
					});
			}
		}
	};
	const saveEditedCustomer = async (custId) => {
		console.log(custId);
		if (isLoading) {
			showNotification(
				<span className='d-flex align-items-center'>
					<Icon icon='Info' size='lg' className='me-1' />
					<span>Alert!</span>
				</span>,
				'Please wait',
			);
		} else {
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

				// Edit and save document in collection "Carriers"
				await setDoc(doc(firestoredb, 'customers', custId), {
					name: customerName,
					customerPassword: customerPassword,
					customerEmail: customerEmail,
					customerMembership: customerMembership,
					addressLine1: addressLine1,
					addressLine2: addressLine2,
					state: state,
					city: city,
					zip: zip,
					type: customerType,
					creditLimit: creditLimit,
					avaliableCredit: avaliableCredit,
					mcNumber: mcNumber,
					usDotNumber: usDotNumber,
					Fax: Fax,
					telephone: telephone,
				})
					.then(async (docRef) => {
						console.log('Document has been added successfully');
						console.log(docRef);
						setEditModalStatus(false);
						setIsLoading(false);
						showNotification(
							<span className='d-flex align-items-center'>
								<Icon icon='Info' size='lg' className='me-1' />
								<span>Success!</span>
							</span>,
							'Customer Updated Successfully!',
						);
					})
					.catch((error) => {
						setIsLoading(false);
						console.log(error);
						showNotification(
							<span className='d-flex align-items-center'>
								<Icon icon='Info' size='lg' className='me-1' />
								<span>Error!</span>
							</span>,
							'Something went wrong!',
						);
					});
			}
		}
	};

	useEffect(() => {
		setIsLoadingData(true);

		getCustomerData();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps
	useEffect(() => {
		console.log(customerData);
	}, [customerData]); // eslint-disable-line react-hooks/exhaustive-deps
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
									<FormGroup isFloating label='Balance' className='col-12'>
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
									<FormGroup isFloating label='Payments' className='col-12'>
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
						onClick={(e) => {
							setIsEditingCustomer(false);
							setCustomerDataInModal('');
							setEditModalStatus(true);
						}}>
						Add New Power Unit
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page>
				{isLoadingData && (
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
											<th>Make/Model </th>
											<th>Power Unit Number</th>
											<th>License Plate</th>
											<th>License Plate Expiration</th>
											<th>Vehicle ID Number</th>
											<th>Ownership</th>
											<th>Inspection Expiration</th>
											<th>DOT Expiration</th>
											<th>Status</th>
										</tr>
									</thead>
									<tbody>
										{customerData &&
										customerData !== undefined &&
										customerData != null &&
										customerData.length > 0 ? (
											dataPagination(customerData, currentPage, perPage).map(
												(i) => (
													<tr key={i.id}>
														<td>
															<div className='d-flex align-items-center'>
																<div className='flex-shrink-0'>
																	<div
																		className='ratio ratio-1x1 me-3'
																		style={{ width: 48 }}>
																		<div
																			className={`bg-l${
																				darkModeStatus
																					? 'o25'
																					: '25'
																			}-${getColorNameWithIndex(
																				currentPage,
																			)} text-${getColorNameWithIndex(
																				currentPage,
																			)} rounded-2 d-flex align-items-center justify-content-center`}>
																			<span className='fw-bold'>
																				{i.data.name &&
																				i.data.name !=
																					'' ? (
																					getFirstLetter(
																						i.data.name,
																					)
																				) : (
																					<></>
																				)}
																			</span>
																		</div>
																	</div>
																</div>
																<div className='flex-grow-1'>
																	<div className='fs-6 fw-bold'>
																		{i.data.name}
																	</div>
																	<div className='text-muted'>
																		<Icon icon='Label' />{' '}
																		<small>
																			{i.data.type
																				? i.data.type
																				: ''}
																		</small>
																	</div>
																</div>
															</div>
														</td>
														<td>
															<Button
																isLink
																color='light'
																icon='Email'
																className='text-lowercase'
																tag='a'
																href={`mailto:${i.data.customerEmail}`}>
																{i.data.customerEmail}
															</Button>
														</td>
														<td>
															<div>
																{i.data.customerMembership &&
																i.data.customerMembership !== '' ? (
																	moment(
																		i.data.customerMembership,
																	).format('ll')
																) : (
																	<></>
																)}
															</div>
															<div>
																<small className='text-muted'>
																	{i.data.customerMembership &&
																	i.data.customerMembership !==
																		'' ? (
																		moment(
																			i.data
																				.customerMembership,
																		).fromNow()
																	) : (
																		<></>
																	)}
																</small>
															</div>
														</td>
														<td>
															<Icon
																size='lg'
																icon={`custom ${i.data.state.toLowerCase()}`}
															/>{' '}
															{i.data.state}
														</td>
														<td>{i.data.zip}</td>
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
																			onClick={(e) => {
																				setIsEditingCustomer(
																					true,
																				);
																				setIsLoadingData(
																					true,
																				);
																				setEditModalStatus(
																					true,
																				);
																				getCustomerDataWithId(
																					i.id,
																				);
																				setEditedCustomerId(
																					i.id,
																				);
																			}}
																			// to={`../../${demoPages.crm.subMenu.customerID.path}/${i.id}`}>
																		>
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
					<ModalTitle>Power Unit Details</ModalTitle>
				</ModalHeader>
				<ModalBody className='px-4'>
					<div className='row g-4'>
						<div className='col-md-12'>
							<Card className='rounded-1 mb-0'>
								<CardHeader>
									<CardLabel icon='ReceiptLong'>
										<CardTitle>Asset Profile Address</CardTitle>
									</CardLabel>
								</CardHeader>
								<CardBody>
									<div className='row g-4'>
										<div className='col-md-6'>
											<FormGroup isFloating id='makeModel' label='Make/Model'>
												<Input
													placeholder='Make/Model'
													onChange={(e) => {
														setmakeModel(e.target.value);
													}}
													value={makeModel}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='powerUnitNumber'
												label='Power Unit Number'>
												<Input
													placeholder='Power Unit Number'
													onChange={(e) => {
														setpowerUnitNumber(e.target.value);
													}}
													value={powerUnitNumber}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='engineType'
												label='Engine Type'>
												<Input
													placeholder='Engine Type'
													onChange={(e) => {
														setengineType(e.target.value);
													}}
													value={engineType}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='transmissionType'
												label='Transmission Type'>
												<Input
													placeholder='Transmission Type'
													onChange={(e) => {
														settransmissionType(e.target.value);
													}}
													value={transmissionType}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup isFloating id='fuelType' label='Fuel Type'>
												<Input
													placeholder='Fuel Type'
													onChange={(e) => {
														setfuelType(e.target.value);
													}}
													value={fuelType}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='horsepower'
												label='Horsepower'>
												<Input
													placeholder='Horsepower'
													onChange={(e) => {
														sethorsepower(e.target.value);
													}}
													value={horsepower}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='licensePlate'
												label='License Plate'>
												<Input
													placeholder='License Plate'
													onChange={(e) => {
														setlicensePlate(e.target.value);
													}}
													value={licensePlate}
												/>
											</FormGroup>

											<FormGroup isFloating id='modelYear' label='Model Year'>
												<Input
													placeholder='Model Year'
													onChange={(e) => {
														setmodelYear(e.target.value);
													}}
													value={modelYear}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='vehicleIdNumber'
												label='Vehicle ID Number'>
												<Input
													placeholder='Vehicle ID Number'
													onChange={(e) => {
														setvehicleIdNumber(e.target.value);
													}}
													value={vehicleIdNumber}
												/>
											</FormGroup>
											<FormGroup isFloating id='assetstatus' label='Status'>
												<Input
													placeholder='Status'
													onChange={(e) => {
														setassetstatus(e.target.value);
													}}
													value={assetstatus}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='insuranceInformation'
												label='Insurance Information'>
												<Input
													placeholder='Insurance Information'
													onChange={(e) => {
														setinsuranceInformation(e.target.value);
													}}
													value={insuranceInformation}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='registeredStates'
												label='Registered States'>
												<Input
													placeholder='Registered States'
													onChange={(e) => {
														setregisteredStates(e.target.value);
													}}
													value={registeredStates}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup isFloating id='assetLength' label='Length'>
												<Input
													placeholder='Length'
													onChange={(e) => {
														setassetLength(e.target.value);
													}}
													value={assetLength}
												/>
											</FormGroup>
											<FormGroup isFloating id='assetWidth' label='Width'>
												<Input
													placeholder='Width'
													onChange={(e) => {
														setassetWidth(e.target.value);
													}}
													value={assetWidth}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup isFloating id='assetHeight' label='Height'>
												<Input
													placeholder='Height'
													onChange={(e) => {
														setassetHeight(e.target.value);
													}}
													value={assetHeight}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='numberOfAxles'
												label='Number of Axles'>
												<Input
													placeholder='Number of Axles'
													onChange={(e) => {
														setnumberOfAxles(e.target.value);
													}}
													value={numberOfAxles}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='unloadedVehicleWeight'
												label='Unloaded Vehicle Weight'>
												<Input
													placeholder='Unloaded Vehicle Weight'
													onChange={(e) => {
														setunloadedVehicleWeight(e.target.value);
													}}
													value={unloadedVehicleWeight}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='grossVehicleWeight'
												label='Gross Vehicle Weight'>
												<Input
													placeholder='Gross Vehicle Weight'
													onChange={(e) => {
														setgrossVehicleWeight(e.target.value);
													}}
													value={grossVehicleWeight}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup isFloating id='notes' label='Notes'>
												<Input
													placeholder='Notes'
													onChange={(e) => {
														setnotes(e.target.value);
													}}
													value={notes}
												/>
											</FormGroup>
										</div>
									</div>
								</CardBody>
							</Card>
							<Card className='rounded-1 mb-0'>
								<CardHeader>
									<CardLabel icon='ReceiptLong'>
										<CardTitle>Ownership Info</CardTitle>
									</CardLabel>
								</CardHeader>
								<CardBody>
									<div className='row g-4'>
										<div className='col-md-6'>
											<FormGroup isFloating id='ownership' label='Ownership'>
												<Select
													defaultValue={'Company'}
													placeholder='Ownership'
													onChange={(e) => {
														setownership(e.target.value);
													}}
													value={ownership}>
													<Option key={1} value='Company'>
														Company
													</Option>
													<Option key={2} value='Owner/Operator'>
														Owner/Operator
													</Option>
												</Select>
											</FormGroup>
											<FormGroup
												isFloating
												id='powerUnitNumber'
												label='Power Unit Number'>
												<Input
													placeholder='Power Unit Number'
													onChange={(e) => {
														setpowerUnitNumber(e.target.value);
													}}
													value={powerUnitNumber}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='engineType'
												label='Engine Type'>
												<Input
													placeholder='Engine Type'
													onChange={(e) => {
														setengineType(e.target.value);
													}}
													value={engineType}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='transmissionType'
												label='Transmission Type'>
												<Input
													placeholder='Transmission Type'
													onChange={(e) => {
														settransmissionType(e.target.value);
													}}
													value={transmissionType}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup isFloating id='fuelType' label='Fuel Type'>
												<Input
													placeholder='Fuel Type'
													onChange={(e) => {
														setfuelType(e.target.value);
													}}
													value={fuelType}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='horsepower'
												label='Horsepower'>
												<Input
													placeholder='Horsepower'
													onChange={(e) => {
														sethorsepower(e.target.value);
													}}
													value={horsepower}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='licensePlate'
												label='License Plate'>
												<Input
													placeholder='License Plate'
													onChange={(e) => {
														setlicensePlate(e.target.value);
													}}
													value={licensePlate}
												/>
											</FormGroup>

											<FormGroup isFloating id='modelYear' label='Model Year'>
												<Input
													placeholder='Model Year'
													onChange={(e) => {
														setmodelYear(e.target.value);
													}}
													value={modelYear}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='vehicleIdNumber'
												label='Vehicle ID Number'>
												<Input
													placeholder='Vehicle ID Number'
													onChange={(e) => {
														setvehicleIdNumber(e.target.value);
													}}
													value={vehicleIdNumber}
												/>
											</FormGroup>
											<FormGroup isFloating id='assetstatus' label='Status'>
												<Input
													placeholder='Status'
													onChange={(e) => {
														setassetstatus(e.target.value);
													}}
													value={assetstatus}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='insuranceInformation'
												label='Insurance Information'>
												<Input
													placeholder='Insurance Information'
													onChange={(e) => {
														setinsuranceInformation(e.target.value);
													}}
													value={insuranceInformation}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='registeredStates'
												label='Registered States'>
												<Input
													placeholder='Registered States'
													onChange={(e) => {
														setregisteredStates(e.target.value);
													}}
													value={registeredStates}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup isFloating id='assetLength' label='Length'>
												<Input
													placeholder='Length'
													onChange={(e) => {
														setassetLength(e.target.value);
													}}
													value={assetLength}
												/>
											</FormGroup>
											<FormGroup isFloating id='assetWidth' label='Width'>
												<Input
													placeholder='Width'
													onChange={(e) => {
														setassetWidth(e.target.value);
													}}
													value={assetWidth}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup isFloating id='assetHeight' label='Height'>
												<Input
													placeholder='Height'
													onChange={(e) => {
														setassetHeight(e.target.value);
													}}
													value={assetHeight}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='numberOfAxles'
												label='Number of Axles'>
												<Input
													placeholder='Number of Axles'
													onChange={(e) => {
														setnumberOfAxles(e.target.value);
													}}
													value={numberOfAxles}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='unloadedVehicleWeight'
												label='Unloaded Vehicle Weight'>
												<Input
													placeholder='Unloaded Vehicle Weight'
													onChange={(e) => {
														setunloadedVehicleWeight(e.target.value);
													}}
													value={unloadedVehicleWeight}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='grossVehicleWeight'
												label='Gross Vehicle Weight'>
												<Input
													placeholder='Gross Vehicle Weight'
													onChange={(e) => {
														setgrossVehicleWeight(e.target.value);
													}}
													value={grossVehicleWeight}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup isFloating id='notes' label='Notes'>
												<Input
													placeholder='Notes'
													onChange={(e) => {
														setnotes(e.target.value);
													}}
													value={notes}
												/>
											</FormGroup>
										</div>
									</div>
								</CardBody>
							</Card>
						</div>
					</div>
				</ModalBody>
				<ModalFooter className='px-4 pb-4'>
					{!isEditingCustomer ? (
						<Button color='info' onClick={addNewCustomer}>
							{' '}
							{isLoading && <Spinner isSmall inButton isGrow />}
							Save
						</Button>
					) : (
						<Button
							color='info'
							onClick={(e) => {
								saveEditedCustomer(editedCustomerId);
							}}>
							{' '}
							{isLoading && <Spinner isSmall inButton isGrow />}
							Save Changes
						</Button>
					)}
				</ModalFooter>
			</Modal>
			{/* <CustomerEditModal setIsOpen={setEditModalStatus} isOpen={editModalStatus} id='0' /> */}
		</PageWrapper>
	);
};

export default ViewPowerUnits;
