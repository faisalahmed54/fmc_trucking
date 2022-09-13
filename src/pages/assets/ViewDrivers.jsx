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

const ViewDrivers = () => {
	//States

	//Driver Profile
	const [driverName, setdriverName] = useState('');
	const [phoneNumber, setphoneNumber] = useState('');
	const [email, setemail] = useState('');
	const [driverType, setdriverType] = useState('');
	const [driverStatus, setdriverStatus] = useState('');
	const [driverEmployeeNumber, setdriverEmployeeNumber] = useState('');
	const [dateOfBirth, setdateOfBirth] = useState('');
	const [driverAddress, setdriverAddress] = useState('');
	const [notes, setnotes] = useState('');
	const [ownership, setownership] = useState('');

	//Driver Experience
	const [commercial, setcommercial] = useState('');
	const [typeOfExperience, settypeOfExperience] = useState('');
	const [driverSchool, setdriverSchool] = useState('');
	const [cdlNumber, setcdlNumber] = useState('');
	const [licenseTypeClass, setlicenseTypeClass] = useState('');
	const [licenseEndorsements, setlicenseEndorsements] = useState('');
	//Driver Employment
	const [applicationDate, setapplicationDate] = useState('');
	const [hireDate, sethireDate] = useState('');
	const [terminationDate, setterminationDate] = useState('');
	const [rehirable, setrehirable] = useState('');
	const [bonusEligibilityDate, setbonusEligibilityDate] = useState('');
	const [employmentNotes, setemploymentNotes] = useState('');

	//Driver Insurance
	const [insuranceCo, setinsuranceCo] = useState('');
	const [groupNumber, setgroupNumber] = useState('');
	const [idNumber, setidNumber] = useState('');

	//Driver Safety
	const [licenseExpirationDate, setlicenseExpirationDate] = useState('');
	const [twicExpirationDate, settwicExpirationDate] = useState('');
	const [hazmatExpirationDate, sethazmatExpirationDate] = useState('');
	const [dotMedicalExpirationDate, setdotMedicalExpirationDate] = useState('');
	const [insuranceExpirationDate, setinsuranceExpirationDate] = useState('');
	const [lastRoadTestDate, setlastRoadTestDate] = useState('');
	const [lastDrugTestDate, setlastDrugTestDate] = useState('');
	const [lastAlcoholTestDate, setlastAlcoholTestDate] = useState('');

	//Customize Units of Measurement
	const [weightUnit, setweightUnit] = useState('');
	const [distanceUnit, setdistanceUnit] = useState('');
	const [temperatureUnit, settemperatureUnit] = useState('');

	//Data from database
	const [driverData, setDriverData] = useState([]);
	const [count, setCount] = useState(0);

	const [editedDriverId, setEditedDriverId] = useState(false);
	const [isEditingDriver, setisEditingDriver] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(false);

	const { darkModeStatus } = useDarkMode();

	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(PER_COUNT['10']);

	const formik = useFormik({
		initialValues: {
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
	function addInvalidClass(elementId) {
		var element = document.getElementById(elementId);
		element.classList.add('is-invalid');
	}
	function removeInvalidClass(elementId) {
		var element = document.getElementById(elementId);
		element.classList.remove('is-invalid');
	}
	function checkValidation() {
		var errorOccurs = false;
		if (!driverName || driverName == '') {
			addInvalidClass('driverName');
			errorOccurs = true;
		} else {
			removeInvalidClass('driverName');
			errorOccurs = false;
		}
		if (!email || email == '') {
			addInvalidClass('email');
			errorOccurs = true;
		} else {
			removeInvalidClass('email');
			errorOccurs = false;
		}
		if (!driverType || driverType == '') {
			addInvalidClass('driverType');
			errorOccurs = true;
		} else {
			removeInvalidClass('driverType');
			errorOccurs = false;
		}
		if (!phoneNumber || phoneNumber == '') {
			addInvalidClass('phoneNumber');
			errorOccurs = true;
		} else {
			removeInvalidClass('phoneNumber');
			errorOccurs = false;
		}
		return errorOccurs;
	}
	//Handlers

	const getDriverData = async () => {
		const q = query(collection(firestoredb, 'drivers'));
		const querySnapshot = await getDocs(q);
		if (querySnapshot.docs.length < 1) {
			console.log('No Data');
			setIsLoadingData(false);
		} else {
			setDriverData([]);
			querySnapshot.forEach((docRef) => {
				// doc.data() is never undefined for query doc snapshots
				// console.log(docRef.id, ' => ', docRef.data());
				setDriverData((prev) => [...prev, { id: docRef.id, data: docRef.data() }]);
			});
			setIsLoadingData(false);
		}
	};
	function setDriverDataInModal(dvrData) {
		if (dvrData == [] || dvrData == '' || dvrData == undefined || !dvrData) {
			setdriverName('');
			setphoneNumber('');
			setemail('');
			setdriverType('');
			setdriverStatus('');
			setdriverEmployeeNumber('');
			setdateOfBirth('');
			setdriverAddress('');
			setnotes('');
			setownership('');
			setcommercial('');
			settypeOfExperience('');
			setdriverSchool('');
			setcdlNumber('');
			setlicenseTypeClass('');
			setlicenseEndorsements('');
			setapplicationDate('');
			sethireDate('');
			setterminationDate('');
			setrehirable('');
			setbonusEligibilityDate('');
			setemploymentNotes('');
			setinsuranceCo('');
			setgroupNumber('');
			setidNumber('');
			setlicenseExpirationDate('');
			settwicExpirationDate('');
			sethazmatExpirationDate('');
			setdotMedicalExpirationDate('');
			setinsuranceExpirationDate('');
			setlastRoadTestDate('');
			setlastDrugTestDate('');
			setlastAlcoholTestDate('');
			setweightUnit('');
			setdistanceUnit('');
			settemperatureUnit('');
		} else {
			setdriverName(dvrData.driverName);
			setphoneNumber(dvrData.driverName);
			setemail(dvrData.driverName);
			setdriverType(dvrData.driverName);
			setdriverStatus(dvrData.driverName);
			setdriverEmployeeNumber(dvrData.driverName);
			setdateOfBirth(dvrData.driverName);
			setdriverAddress(dvrData.driverName);
			setnotes(dvrData.notes);
			setownership(dvrData.ownership);
			setcommercial(dvrData.commercial);
			settypeOfExperience(dvrData.typeOfExperience);
			setdriverSchool(dvrData.driverSchool);
			setcdlNumber(dvrData.cdlNumber);
			setlicenseTypeClass(dvrData.licenseTypeClass);
			setlicenseEndorsements(dvrData.licenseEndorsements);
			setapplicationDate(dvrData.applicationDate);
			sethireDate(dvrData.hireDate);
			setterminationDate(dvrData.terminationDate);
			setrehirable(dvrData.rehirable);
			setbonusEligibilityDate(dvrData.bonusEligibilityDate);
			setemploymentNotes(dvrData.employmentNotes);
			setinsuranceCo(dvrData.insuranceCo);
			setgroupNumber(dvrData.groupNumber);
			setidNumber(dvrData.idNumber);
			setlicenseExpirationDate(dvrData.licenseExpirationDate);
			settwicExpirationDate(dvrData.twicExpirationDate);
			sethazmatExpirationDate(dvrData.hazmatExpirationDate);
			setdotMedicalExpirationDate(dvrData.dotMedicalExpirationDate);
			setinsuranceExpirationDate(dvrData.insuranceExpirationDate);
			setlastRoadTestDate(dvrData.lastRoadTestDate);
			setlastDrugTestDate(dvrData.lastDrugTestDate);
			setlastAlcoholTestDate(dvrData.lastAlcoholTestDate);
			setweightUnit(dvrData.weightUnit);
			setdistanceUnit(dvrData.distanceUnit);
			settemperatureUnit(dvrData.temperatureUnit);
		}
		setIsLoadingData(false);
	}
	const getDriverDataWithId = async (driverId) => {
		// console.log(result[4]);
		const docRef = doc(firestoredb, 'drivers', driverId);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			console.log('Document data:', docSnap.data());
			setDriverDataInModal(docSnap.data());
		} else {
			// doc.data() will be undefined in this case
			console.log('No such document!');
			setIsLoadingData(false);
		}
	};
	const addNewDriver = async () => {
		if (checkValidation()) {
			showNotification(
				<span className='d-flex align-items-center'>
					<Icon icon='Info' size='lg' className='me-1' />
					<span>Error!</span>
				</span>,
				'All Fields are mandatory',
			);
		} else {
			setIsLoading(true);
			const docRef = doc(firestoredb, 'drivers', email);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				setIsLoading(false);
				console.log('Document data:', docSnap.data());
				showNotification(
					<span className='d-flex align-items-center'>
						<Icon icon='Info' size='lg' className='me-1' />
						<span>Alert!</span>
					</span>,
					'Driver Already Existed !',
				);
			} else {
				// doc.data() will be undefined in this case
				console.log('No such document!');
				await setDoc(doc(firestoredb, 'drivers', email), {
					driverName: driverName,
					phoneNumber: phoneNumber,
					email: email,
					driverType: driverType,
					driverStatus: driverStatus,
					driverEmployeeNumber: driverEmployeeNumber,
					dateOfBirth: dateOfBirth,
					ownership: ownership,
					driverAddress: driverAddress,
					notes: notes,
					commercial: commercial,
					typeOfExperience: typeOfExperience,
					driverSchool: driverSchool,
					cdlNumber: cdlNumber,
					licenseTypeClass: licenseTypeClass,
					licenseEndorsements: licenseEndorsements,
					applicationDate: applicationDate,
					hireDate: hireDate,
					terminationDate: terminationDate,
					rehirable: rehirable,
					bonusEligibilityDate: bonusEligibilityDate,
					employmentNotes: employmentNotes,
					insuranceCo: insuranceCo,
					groupNumber: groupNumber,
					idNumber: idNumber,
					licenseExpirationDate: licenseExpirationDate,
					twicExpirationDate: twicExpirationDate,
					hazmatExpirationDate: hazmatExpirationDate,
					dotMedicalExpirationDate: dotMedicalExpirationDate,
					insuranceExpirationDate: insuranceExpirationDate,
					lastRoadTestDate: lastRoadTestDate,
					lastDrugTestDate: lastDrugTestDate,
					lastAlcoholTestDate: lastAlcoholTestDate,
					weightUnit: weightUnit,
					distanceUnit: distanceUnit,
					temperatureUnit: temperatureUnit,
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
							'Driver Added Successfully!',
						);
						getDriverData();
					})
					.catch((error) => {
						console.log(error);
					});
			}
		}
	};
	const saveEditedDriver = async (driverId) => {
		console.log(driverId);
		if (isLoading) {
			showNotification(
				<span className='d-flex align-items-center'>
					<Icon icon='Info' size='lg' className='me-1' />
					<span>Alert!</span>
				</span>,
				'Please wait',
			);
		} else {
			if (checkValidation()) {
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
				await setDoc(doc(firestoredb, 'drivers', driverId), {
					driverName: driverName,
					phoneNumber: phoneNumber,
					email: email,
					driverType: driverType,
					driverStatus: driverStatus,
					driverEmployeeNumber: driverEmployeeNumber,
					dateOfBirth: dateOfBirth,
					ownership: ownership,
					driverAddress: driverAddress,
					notes: notes,
					commercial: commercial,
					typeOfExperience: typeOfExperience,
					driverSchool: driverSchool,
					cdlNumber: cdlNumber,
					licenseTypeClass: licenseTypeClass,
					licenseEndorsements: licenseEndorsements,
					applicationDate: applicationDate,
					hireDate: hireDate,
					terminationDate: terminationDate,
					rehirable: rehirable,
					bonusEligibilityDate: bonusEligibilityDate,
					employmentNotes: employmentNotes,
					insuranceCo: insuranceCo,
					groupNumber: groupNumber,
					idNumber: idNumber,
					licenseExpirationDate: licenseExpirationDate,
					twicExpirationDate: twicExpirationDate,
					hazmatExpirationDate: hazmatExpirationDate,
					dotMedicalExpirationDate: dotMedicalExpirationDate,
					insuranceExpirationDate: insuranceExpirationDate,
					lastRoadTestDate: lastRoadTestDate,
					lastDrugTestDate: lastDrugTestDate,
					lastAlcoholTestDate: lastAlcoholTestDate,
					weightUnit: weightUnit,
					distanceUnit: distanceUnit,
					temperatureUnit: temperatureUnit,
				})
					.then(async (docRef) => {
						console.log('Driver has been added successfully');
						console.log(docRef);
						setEditModalStatus(false);
						setIsLoading(false);
						showNotification(
							<span className='d-flex align-items-center'>
								<Icon icon='Info' size='lg' className='me-1' />
								<span>Success!</span>
							</span>,
							'Driver Updated Successfully!',
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

		getDriverData();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps
	useEffect(() => {
		console.log(driverData);
	}, [driverData]); // eslint-disable-line react-hooks/exhaustive-deps
	return (
		<PageWrapper title={dashboardMenu.assets.subMenu.viewDrivers.text}>
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
						placeholder='Search Driver...'
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
							setisEditingDriver(false);
							setDriverDataInModal('');
							setEditModalStatus(true);
						}}>
						Add New Driver
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
											<th>Driver Name</th>
											<th>Phone Number</th>
											<th>Email</th>
											<th>License Expiration Date</th>
											<th>Driver Type</th>
											<th>Status</th>
											<th>Driver/Employee Number</th>
										</tr>
									</thead>
									<tbody>
										{driverData &&
										driverData !== undefined &&
										driverData != null &&
										driverData.length > 0 ? (
											dataPagination(driverData, currentPage, perPage).map(
												(i) => (
													<tr key={i.id}>
														<td>{i.data.driverName}</td>
														<td>{i.data.phoneNumber}</td>
														<td>{i.data.email}</td>

														<td>
															<div>
																{i.data.licenseExpirationDate &&
																i.data.licenseExpirationDate !==
																	'' ? (
																	moment(
																		i.data
																			.licenseExpirationDate,
																	).format('ll')
																) : (
																	<></>
																)}
															</div>
														</td>

														<td>{i.data.driverType}</td>
														<td>{i.data.driverStatus}</td>
														<td>{i.data.driverEmployeeNumber}</td>

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
																				setisEditingDriver(
																					true,
																				);
																				setIsLoadingData(
																					true,
																				);
																				setEditModalStatus(
																					true,
																				);
																				getDriverDataWithId(
																					i.id,
																				);
																				setEditedDriverId(
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
								label='drivers'
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
					<ModalTitle>Driver Details</ModalTitle>
				</ModalHeader>
				<ModalBody className='px-4'>
					<div className='row g-4'>
						<div className='col-md-12'>
							<Card className='rounded-1 mb-0'>
								<CardHeader>
									<CardLabel icon='ReceiptLong'>
										<CardTitle>Driver Profile</CardTitle>
									</CardLabel>
								</CardHeader>
								<CardBody>
									<div className='row g-4'>
										<div className='col-md-6'>
											<FormGroup isFloating label='Driver Name*'>
												<Input
													id='driverName'
													placeholder='Driver Name*'
													onChange={(e) => {
														setdriverName(e.target.value);
													}}
													value={driverName}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='phoneNumber'
												label='Phone Number*'>
												<Input
													disabled={isEditingDriver}
													placeholder='Phone Number*'
													onChange={(e) => {
														setphoneNumber(e.target.value);
													}}
													value={phoneNumber}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup isFloating id='email' label='Email*'>
												<Input
													disabled={isEditingDriver}
													placeholder='Email*'
													onChange={(e) => {
														setemail(e.target.value);
													}}
													value={email}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='driverType'
												label='Driver Type'>
												<Select
													defaultValue={'Single'}
													disabled={isEditingDriver}
													placeholder='Driver Type'
													onChange={(e) => {
														setdriverType(e.target.value);
													}}
													value={driverType}>
													<Option key={1} value='Single'>
														Single
													</Option>
													<Option key={2} value='Team'>
														Team
													</Option>
												</Select>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='driverStatus'
												label='Driver Status'>
												<Input
													disabled={isEditingDriver}
													placeholder='Driver Status'
													onChange={(e) => {
														setdriverStatus(e.target.value);
													}}
													value={driverStatus}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='driverEmployeeNumber'
												label='Driver/Employee Number'>
												<Input
													disabled={isEditingDriver}
													placeholder='Driver/Employee Number'
													onChange={(e) => {
														setdriverEmployeeNumber(e.target.value);
													}}
													value={driverEmployeeNumber}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='dateOfBirth'
												label='Date of Birth*'>
												<Input
													type='date'
													disabled={isEditingDriver}
													placeholder='Date of Birth*'
													onChange={(e) => {
														setdateOfBirth(e.target.value);
													}}
													value={dateOfBirth}
												/>
											</FormGroup>
											<FormGroup isFloating id='ownership' label='Ownership'>
												<Select
													disabled={isEditingDriver}
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
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='driverAddress'
												label='Address'>
												<Textarea
													disabled={isEditingDriver}
													placeholder='Address'
													onChange={(e) => {
														setdriverAddress(e.target.value);
													}}
													value={driverAddress}
												/>
											</FormGroup>
											<FormGroup isFloating id='notes' label='Notes'>
												<Textarea
													disabled={isEditingDriver}
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
										<CardTitle>Driver Experience</CardTitle>
									</CardLabel>
								</CardHeader>
								<CardBody>
									<div className='row g-4'>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='commercial'
												label='Commercial'>
												<Input
													disabled={isEditingDriver}
													placeholder='Commercial'
													onChange={(e) => {
														setcommercial(e.target.value);
													}}
													value={commercial}
												/>
											</FormGroup>

											<FormGroup
												isFloating
												id='typeOfExperience'
												label='Type of Experience'>
												<Input
													disabled={isEditingDriver}
													placeholder='Type of Experience'
													onChange={(e) => {
														settypeOfExperience(e.target.value);
													}}
													value={typeOfExperience}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='driverSchool'
												label='Driving School'>
												<Input
													disabled={isEditingDriver}
													placeholder='Driving School'
													onChange={(e) => {
														setdriverSchool(e.target.value);
													}}
													value={driverSchool}
												/>
											</FormGroup>
											<FormGroup isFloating id='cdlNumber' label='CDL Number'>
												<Input
													disabled={isEditingDriver}
													placeholder='CDL Number'
													onChange={(e) => {
														setcdlNumber(e.target.value);
													}}
													value={cdlNumber}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='licenseTypeClass'
												label='License Type/Class'>
												<Select
													disabled={isEditingDriver}
													placeholder='License Type/Class'
													onChange={(e) => {
														setlicenseTypeClass(e.target.value);
													}}
													value={licenseTypeClass}>
													<Option key={1} value='A'>
														A
													</Option>
													<Option key={1} value='B'>
														B
													</Option>
													<Option key={1} value='C'>
														C
													</Option>
													<Option key={1} value='D'>
														D
													</Option>
													<Option key={1} value='E'>
														E
													</Option>
													<Option key={1} value='F'>
														F
													</Option>
													<Option key={1} value='DJ'>
														DJ
													</Option>
													<Option key={1} value='O'>
														O
													</Option>
													<Option key={1} value='P'>
														P
													</Option>
													<Option key={1} value='R'>
														R
													</Option>
													<Option key={1} value='S'>
														S
													</Option>
												</Select>
											</FormGroup>
											<FormGroup
												isFloating
												id='licenseEndorsements'
												label='License Endorsements'>
												<Input
													disabled={isEditingDriver}
													placeholder='License Endorsements'
													onChange={(e) => {
														setlicenseEndorsements(e.target.value);
													}}
													value={licenseEndorsements}
												/>
											</FormGroup>
										</div>
									</div>
								</CardBody>
							</Card>
							<Card className='rounded-1 mb-0'>
								<CardHeader>
									<CardLabel icon='ReceiptLong'>
										<CardTitle>Driver Employment</CardTitle>
									</CardLabel>
								</CardHeader>
								<CardBody>
									<div className='row g-4'>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='applicationDate'
												label='Application Date'>
												<Input
													disabled={isEditingDriver}
													type='date'
													placeholder='Application Date'
													onChange={(e) => {
														setapplicationDate(e.target.value);
													}}
													value={applicationDate}
												/>
											</FormGroup>
											<FormGroup isFloating id='hireDate' label='Hire Date'>
												<Input
													disabled={isEditingDriver}
													type='date'
													placeholder='Hire Date'
													onChange={(e) => {
														sethireDate(e.target.value);
													}}
													value={hireDate}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='terminationDate'
												label='Termination Date'>
												<Input
													disabled={isEditingDriver}
													type='date'
													placeholder='Termination Date'
													onChange={(e) => {
														setterminationDate(e.target.value);
													}}
													value={terminationDate}
												/>
											</FormGroup>
											<FormGroup isFloating id='rehirable' label='Rehirable?'>
												<Input
													disabled={isEditingDriver}
													type='date'
													placeholder='Rehirable?'
													onChange={(e) => {
														setrehirable(e.target.value);
													}}
													value={rehirable}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='bonusEligibilityDate'
												label='Bonus Eligibility Date'>
												<Input
													disabled={isEditingDriver}
													type='date'
													placeholder='Bonus Eligibility Date'
													onChange={(e) => {
														setbonusEligibilityDate(e.target.value);
													}}
													value={bonusEligibilityDate}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='employmentNotes'
												label='Employment Notes'>
												<Textarea
													disabled={isEditingDriver}
													placeholder='Employment Notes'
													onChange={(e) => {
														setemploymentNotes(e.target.value);
													}}
													value={employmentNotes}
												/>
											</FormGroup>
										</div>
									</div>
								</CardBody>
							</Card>
							<Card className='rounded-1 mb-0'>
								<CardHeader>
									<CardLabel icon='ReceiptLong'>
										<CardTitle>Driver Insurance</CardTitle>
									</CardLabel>
								</CardHeader>
								<CardBody>
									<div className='row g-4'>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='insuranceCo'
												label='Insurance Co.'>
												<Input
													disabled={isEditingDriver}
													placeholder='Insurance Co.'
													onChange={(e) => {
														setinsuranceCo(e.target.value);
													}}
													value={insuranceCo}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='groupNumber'
												label='Group Number'>
												<Input
													disabled={isEditingDriver}
													placeholder='Group Number'
													onChange={(e) => {
														setgroupNumber(e.target.value);
													}}
													value={groupNumber}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup isFloating id='idNumber' label='Id Number'>
												<Input
													disabled={isEditingDriver}
													placeholder='Id Number'
													onChange={(e) => {
														setidNumber(e.target.value);
													}}
													value={idNumber}
												/>
											</FormGroup>
										</div>
									</div>
								</CardBody>
							</Card>
							<Card className='rounded-1 mb-0'>
								<CardHeader>
									<CardLabel icon='ReceiptLong'>
										<CardTitle>Driver Safety</CardTitle>
									</CardLabel>
								</CardHeader>
								<CardBody>
									<div className='row g-4'>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='licenseExpirationDate'
												label='License Expiration Date'>
												<Input
													disabled={isEditingDriver}
													type='date'
													placeholder='License Expiration Date'
													onChange={(e) => {
														setlicenseExpirationDate(e.target.value);
													}}
													value={licenseExpirationDate}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='twicExpirationDate'
												label='TWIC Card Expiration Date'>
												<Input
													disabled={isEditingDriver}
													type='date'
													placeholder='TWIC Card Expiration Date'
													onChange={(e) => {
														settwicExpirationDate(e.target.value);
													}}
													value={twicExpirationDate}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='hazmatExpirationDate'
												label='Hazmat Endorsement Expiration Date'>
												<Input
													disabled={isEditingDriver}
													type='date'
													placeholder='Hazmat Endorsement Expiration Date'
													onChange={(e) => {
														sethazmatExpirationDate(e.target.value);
													}}
													value={hazmatExpirationDate}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='dotMedicalExpirationDate'
												label='DOT Medical Card Expiration Date'>
												<Input
													disabled={isEditingDriver}
													placeholder='DOT Medical Card Expiration Date'
													onChange={(e) => {
														setdotMedicalExpirationDate(e.target.value);
													}}
													value={dotMedicalExpirationDate}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='insuranceExpirationDate'
												label='Insurance Expiration Date'>
												<Input
													disabled={isEditingDriver}
													type='date'
													placeholder='Insurance Expiration Date'
													onChange={(e) => {
														setinsuranceExpirationDate(e.target.value);
													}}
													value={insuranceExpirationDate}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='lastRoadTestDate'
												label='Last Road Test Date'>
												<Input
													disabled={isEditingDriver}
													type='date'
													placeholder='Last Road Test Date'
													onChange={(e) => {
														setlastRoadTestDate(e.target.value);
													}}
													value={lastRoadTestDate}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='lastDrugTestDate'
												label='Last Drug Test Date'>
												<Input
													disabled={isEditingDriver}
													type='date'
													placeholder='Last Drug Test Date'
													onChange={(e) => {
														setlastDrugTestDate(e.target.value);
													}}
													value={lastDrugTestDate}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='lastAlcoholTestDate'
												label='Last Alcohol Test Date'>
												<Input
													disabled={isEditingDriver}
													type='date'
													placeholder='Last Alcohol Test Date'
													onChange={(e) => {
														setlastAlcoholTestDate(e.target.value);
													}}
													value={lastAlcoholTestDate}
												/>
											</FormGroup>
										</div>
									</div>
								</CardBody>
							</Card>
							<Card className='rounded-1 mb-0'>
								<CardHeader>
									<CardLabel icon='ReceiptLong'>
										<CardTitle>Customize Units of Measurement</CardTitle>
									</CardLabel>
								</CardHeader>
								<CardBody>
									<div className='row g-4'>
										<div className='row g-4'>
											<div className='col-md-6'>
												<FormGroup
													id='weightUnit'
													label='Weight Unit'
													isFloating>
													<Select
														disabled={isEditingDriver}
														defaultValue={`Use my company's default setting`}
														onChange={(e) => {
															setweightUnit(e.target.value);
														}}
														value={weightUnit}>
														<Option
															key={1}
															value={`Use my company's default setting`}>
															Use my company's default setting
														</Option>
														<Option key={2} value='Pounds'>
															Pounds
														</Option>
														<Option key={3} value='Kilograms'>
															Kilograms
														</Option>
													</Select>
												</FormGroup>

												<FormGroup
													id='distanceUnit'
													label='Distance Unit'
													isFloating>
													<Select
														disabled={isEditingDriver}
														defaultValue={`Use my company's default setting`}
														onChange={(e) => {
															setdistanceUnit(e.target.value);
														}}
														value={distanceUnit}>
														<Option
															key={1}
															value={`Use my company's default setting`}>
															Use my company's default setting
														</Option>
														<Option key={2} value='Miles'>
															Miles
														</Option>
														<Option key={3} value='Kilometers'>
															Kilometers
														</Option>
													</Select>
												</FormGroup>
											</div>
											<div className='col-md-6'>
												<FormGroup
													id='temperatureUnit'
													label='Temperature Unit'
													isFloating>
													<Select
														disabled={isEditingDriver}
														defaultValue={`Use my company's default setting`}
														onChange={(e) => {
															settemperatureUnit(e.target.value);
														}}
														value={temperatureUnit}>
														<Option
															key={1}
															value={`Use my company's default setting`}>
															Use my company's default setting
														</Option>
														<Option key={2} value='Fahrenheit'>
															Fahrenheit
														</Option>
														<Option key={3} value='Celsius'>
															Celsius
														</Option>
													</Select>
												</FormGroup>
											</div>
										</div>
									</div>
								</CardBody>
							</Card>
						</div>
					</div>
				</ModalBody>
				<ModalFooter className='px-4 pb-4'>
					{!isEditingDriver ? (
						<Button color='info' onClick={addNewDriver}>
							{' '}
							{isLoading && <Spinner isSmall inButton isGrow />}
							Save
						</Button>
					) : (
						<Button
							color='info'
							onClick={(e) => {
								saveEditedDriver(editedDriverId);
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

export default ViewDrivers;
