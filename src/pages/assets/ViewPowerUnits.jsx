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

const ViewPowerUnits = () => {
	//States

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

	//Ownership info
	const [purchasedOrLeased, setpurchasedOrLeased] = useState('');
	const [purchasedOrLeasedFrom, setpurchasedOrLeasedFrom] = useState('');
	const [soldTo, setsoldTo] = useState('');
	const [purchasedOrLeasedDate, setpurchasedOrLeasedDate] = useState('');
	const [soldOrLeaseEndDate, setsoldOrLeaseEndDate] = useState('');
	const [purchaseLeaseAmount, setpurchaseLeaseAmount] = useState('');
	const [soldAmount, setsoldAmount] = useState('');
	const [factoryPrice, setfactoryPrice] = useState('');
	const [currentValue, setcurrentValue] = useState('');

	//Maintenance and Safety
	const [licensePlateExpiration, setlicensePlateExpiration] = useState('');
	const [inspectionExpiration, setinspectionExpiration] = useState('');
	const [dotExpiration, setdotExpiration] = useState('');
	const [registrationExpiration, setregistrationExpiration] = useState('');
	const [insuranceExpiration, setinsuranceExpiration] = useState('');
	const [estOdometerReading, setestOdometerReading] = useState('');
	const [lastOilChangeDate, setlastOilChangeDate] = useState('');
	const [lastOilChangeMileage, setlastOilChangeMileage] = useState('');
	const [lastTuneUpDate, setlastTuneUpDate] = useState('');
	const [lastTuneUpMileage, setlastTuneUpMileage] = useState('');
	const [lastServiceDate, setlastServiceDate] = useState('');
	const [lastServiceMileage, setlastServiceMileage] = useState('');

	//Integration Ids
	const [keepTruckinVehicleId, setkeepTruckinVehicleId] = useState('');

	//Data from database
	const [powerUnitData, setPowerUnitData] = useState([]);
	const [count, setCount] = useState(0);

	const [editedPowerUnitId, setEditedPowerUnitId] = useState(false);
	const [isEditingPower, setIsEditingPowerUnit] = useState(false);
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
		if (!powerUnitNumber || powerUnitNumber == '') {
			addInvalidClass('powerUnitNumber');
			errorOccurs = true;
		} else {
			removeInvalidClass('powerUnitNumber');
			errorOccurs = false;
		}
		if (!makeModel || makeModel == '') {
			addInvalidClass('makeModel');
			errorOccurs = true;
		} else {
			removeInvalidClass('makeModel');
			errorOccurs = false;
		}
		if (!engineType || engineType == '') {
			addInvalidClass('engineType');
			errorOccurs = true;
		} else {
			removeInvalidClass('engineType');
			errorOccurs = false;
		}
		if (!licensePlate || licensePlate == '') {
			addInvalidClass('licensePlate');
			errorOccurs = true;
		} else {
			removeInvalidClass('licensePlate');
			errorOccurs = false;
		}
		return errorOccurs;
	}
	//Handlers

	const getPowerUnitData = async () => {
		const q = query(collection(firestoredb, 'powerUnits'));
		const querySnapshot = await getDocs(q);
		if (querySnapshot.docs.length < 1) {
			console.log('No Data');
			setIsLoadingData(false);
		} else {
			setPowerUnitData([]);
			querySnapshot.forEach((docRef) => {
				// doc.data() is never undefined for query doc snapshots
				// console.log(docRef.id, ' => ', docRef.data());
				setPowerUnitData((prev) => [...prev, { id: docRef.id, data: docRef.data() }]); 
			});
			setIsLoadingData(false);
		}
	};
	function setPowerUnitDataInModal(puData) {
		if (puData == [] || puData == '' || puData == undefined || !puData) {
			setmakeModel('');
			setpowerUnitNumber('');
			setengineType('');
			settransmissionType('');
			setfuelType('');
			sethorsepower('');
			setlicensePlate('');
			setmodelYear('');
			setvehicleIdNumber('');
			setassetstatus('');
			setinsuranceInformation('');
			setregisteredStates('');
			setassetLength('');
			setassetWidth('');
			setassetHeight('');
			setnumberOfAxles('');
			setunloadedVehicleWeight('');
			setgrossVehicleWeight('');
			setnotes('');
			setownership('');
			setpurchasedOrLeased('');
			setpurchasedOrLeasedFrom('');
			setsoldTo('');
			setpurchasedOrLeasedDate('');
			setsoldOrLeaseEndDate('');
			setpurchaseLeaseAmount('');
			setsoldAmount('');
			setfactoryPrice('');
			setcurrentValue('');
			setlicensePlateExpiration('');
			setinspectionExpiration('');
			setdotExpiration('');
			setregistrationExpiration('');
			setinsuranceExpiration('');
			setestOdometerReading('');
			setlastOilChangeDate('');
			setlastOilChangeMileage('');
			setlastTuneUpDate('');
			setlastTuneUpMileage('');
			setlastServiceDate('');
			setlastServiceMileage('');
			setkeepTruckinVehicleId('');
		} else {
			setmakeModel(puData.makeModel);
			setpowerUnitNumber(puData.powerUnitNumber);
			setengineType(puData.engineType);
			settransmissionType(puData.transmissionType);
			setfuelType(puData.fuelType);
			sethorsepower(puData.horsepower);
			setlicensePlate(puData.licensePlate);
			setmodelYear(puData.modelYear);
			setvehicleIdNumber(puData.vehicleIdNumber);
			setassetstatus(puData.assetstatus);
			setinsuranceInformation(puData.insuranceInformation);
			setregisteredStates(puData.registeredStates);
			setassetLength(puData.assetLength);
			setassetWidth(puData.assetWidth);
			setassetHeight(puData.assetHeight);
			setnumberOfAxles(puData.numberOfAxles);
			setunloadedVehicleWeight(puData.unloadedVehicleWeight);
			setgrossVehicleWeight(puData.grossVehicleWeight);
			setnotes(puData.notes);
			setownership(puData.ownership);
			setpurchasedOrLeased(puData.purchasedOrLeased);
			setpurchasedOrLeasedFrom(puData.purchasedOrLeasedFrom);
			setsoldTo(puData.soldTo);
			setpurchasedOrLeasedDate(puData.purchasedOrLeasedDate);
			setsoldOrLeaseEndDate(puData.soldOrLeaseEndDate);
			setpurchaseLeaseAmount(puData.purchaseLeaseAmount);
			setsoldAmount(puData.soldAmount);
			setfactoryPrice(puData.factoryPrice);
			setcurrentValue(puData.currentValue);
			setlicensePlateExpiration(puData.licensePlateExpiration);
			setinspectionExpiration(puData.inspectionExpiration);
			setdotExpiration(puData.dotExpiration);
			setregistrationExpiration(puData.registrationExpiration);
			setinsuranceExpiration(puData.inspectionExpiration);
			setestOdometerReading(puData.estOdometerReading);
			setlastOilChangeDate(puData.lastOilChangeDate);
			setlastOilChangeMileage(puData.lastOilChangeMileage);
			setlastTuneUpDate(puData.lastTuneUpDate);
			setlastTuneUpMileage(puData.lastTuneUpMileage);
			setlastServiceDate(puData.lastServiceDate);
			setlastServiceMileage(puData.lastServiceMileage);
			setkeepTruckinVehicleId(puData.keepTruckinVehicleId);
		}
		setIsLoadingData(false);
	}
	const getPowerUnitDataWithId = async (powerUnitId) => {
		// console.log(result[4]);
		const docRef = doc(firestoredb, 'powerUnits', powerUnitId);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			console.log('Document data:', docSnap.data());
			setPowerUnitDataInModal(docSnap.data());
		} else {
			// doc.data() will be undefined in this case
			console.log('No such document!');
			setIsLoadingData(false);
		}
	};
	const addNewPowerUnit = async () => {
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
			const docRef = doc(firestoredb, 'powerUnits', powerUnitNumber);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				setIsLoading(false);
				console.log('Document data:', docSnap.data());
				showNotification(
					<span className='d-flex align-items-center'>
						<Icon icon='Info' size='lg' className='me-1' />
						<span>Alert!</span>
					</span>,
					'Power Unit Already Existed !',
				);
			} else {
				// doc.data() will be undefined in this case
				console.log('No such document!');
				await setDoc(doc(firestoredb, 'powerUnits', powerUnitNumber), {
					makeModel: makeModel,
					powerUnitNumber: powerUnitNumber,
					engineType: engineType,
					transmissionType: transmissionType,
					fuelType: fuelType,
					horsepower: horsepower,
					licensePlate: licensePlate,
					modelYear: modelYear,
					vehicleIdNumber: vehicleIdNumber,
					assetstatus: assetstatus,
					insuranceInformation: insuranceInformation,
					registeredStates: registeredStates,
					assetLength: assetLength,
					assetWidth: assetWidth,
					assetHeight: assetHeight,
					numberOfAxles: numberOfAxles,
					unloadedVehicleWeight: unloadedVehicleWeight,
					grossVehicleWeight: grossVehicleWeight,
					ownership: ownership,
					notes: notes,
					purchasedOrLeased: purchasedOrLeased,
					purchasedOrLeasedFrom: purchasedOrLeasedFrom,
					soldTo: soldTo,
					purchasedOrLeasedDate: purchasedOrLeasedDate,
					soldOrLeaseEndDate: soldOrLeaseEndDate,
					purchaseLeaseAmount: purchaseLeaseAmount,
					soldAmount: soldAmount,
					factoryPrice: factoryPrice,
					currentValue: currentValue,
					licensePlateExpiration: licensePlateExpiration,
					inspectionExpiration: inspectionExpiration,
					dotExpiration: dotExpiration,
					registrationExpiration: registrationExpiration,
					ninsuranceExpirationotes: insuranceExpiration,
					estOdometerReading: estOdometerReading,
					lastOilChangeDate: lastOilChangeDate,
					lastOilChangeMileage: lastOilChangeMileage,
					lastTuneUpDate: lastTuneUpDate,
					lastTuneUpMileage: lastTuneUpMileage,
					lastServiceDate: lastServiceDate,
					lastServiceMileage: lastServiceMileage,
					keepTruckinVehicleId: keepTruckinVehicleId,
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
							'Power Unit Added Successfully!',
						);
						getPowerUnitData();
					})
					.catch((error) => {
						console.log(error);
					});
			}
		}
	};
	const saveEditedPowerUnit = async (powerUnitId) => {
		console.log(powerUnitId);
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
				await setDoc(doc(firestoredb, 'powerUnits', powerUnitId), {
					makeModel: makeModel,
					powerUnitNumber: powerUnitNumber,
					engineType: engineType,
					transmissionType: transmissionType,
					fuelType: fuelType,
					horsepower: horsepower,
					licensePlate: licensePlate,
					modelYear: modelYear,
					vehicleIdNumber: vehicleIdNumber,
					assetstatus: assetstatus,
					insuranceInformation: insuranceInformation,
					registeredStates: registeredStates,
					assetLength: assetLength,
					assetWidth: assetWidth,
					assetHeight: assetHeight,
					numberOfAxles: numberOfAxles,
					unloadedVehicleWeight: unloadedVehicleWeight,
					grossVehicleWeight: grossVehicleWeight,
					ownership: ownership,
					notes: notes,
					purchasedOrLeased: purchasedOrLeased,
					purchasedOrLeasedFrom: purchasedOrLeasedFrom,
					soldTo: soldTo,
					purchasedOrLeasedDate: purchasedOrLeasedDate,
					soldOrLeaseEndDate: soldOrLeaseEndDate,
					purchaseLeaseAmount: purchaseLeaseAmount,
					soldAmount: soldAmount,
					factoryPrice: factoryPrice,
					currentValue: currentValue,
					licensePlateExpiration: licensePlateExpiration,
					inspectionExpiration: inspectionExpiration,
					dotExpiration: dotExpiration,
					registrationExpiration: registrationExpiration,
					ninsuranceExpirationotes: insuranceExpiration,
					estOdometerReading: estOdometerReading,
					lastOilChangeDate: lastOilChangeDate,
					lastOilChangeMileage: lastOilChangeMileage,
					lastTuneUpDate: lastTuneUpDate,
					lastTuneUpMileage: lastTuneUpMileage,
					lastServiceDate: lastServiceDate,
					lastServiceMileage: lastServiceMileage,
					keepTruckinVehicleId: keepTruckinVehicleId,
				})
					.then(async (docRef) => {
						console.log('Power Unit has been added successfully');
						console.log(docRef);
						setEditModalStatus(false);
						setIsLoading(false);
						showNotification(
							<span className='d-flex align-items-center'>
								<Icon icon='Info' size='lg' className='me-1' />
								<span>Success!</span>
							</span>,
							'Power Unit Updated Successfully!',
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

		getPowerUnitData();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps
	useEffect(() => {
		console.log(powerUnitData);
	}, [powerUnitData]); // eslint-disable-line react-hooks/exhaustive-deps
	return (
		<PageWrapper title={dashboardMenu.assets.subMenu.viewPowerUnits.text}>
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
						placeholder='Search Power Unit...'
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
							setIsEditingPowerUnit(false);
							setPowerUnitDataInModal('');
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
										{powerUnitData &&
										powerUnitData !== undefined &&
										powerUnitData != null &&
										powerUnitData.length > 0 ? (
											dataPagination(powerUnitData, currentPage, perPage).map(
												(i) => (
													<tr key={i.id}>
														<td>{i.data.makeModel}</td>
														<td>{i.data.powerUnitNumber}</td>
														<td>{i.data.licensePlate}</td>

														<td>
															<div>
																{i.data.licensePlateExpiration &&
																i.data.licensePlateExpiration !==
																	'' ? (
																	moment(
																		i.data
																			.licensePlateExpiration,
																	).format('ll')
																) : (
																	<></>
																)}
															</div>
														</td>

														<td>{i.data.vehicleIdNumber}</td>
														<td>{i.data.ownership}</td>
														<td>
															<div>
																{i.data.inspectionExpiration &&
																i.data.inspectionExpiration !==
																	'' ? (
																	moment(
																		i.data.inspectionExpiration,
																	).format('ll')
																) : (
																	<></>
																)}
															</div>
														</td>
														<td>
															<div>
																{i.data.dotExpiration &&
																i.data.dotExpiration !== '' ? (
																	moment(
																		i.data.dotExpiration,
																	).format('ll')
																) : (
																	<></>
																)}
															</div>
														</td>
														<td>{i.data.assetstatus}</td>
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
																				setIsEditingPowerUnit(
																					true,
																				);
																				setIsLoadingData(
																					true,
																				);
																				setEditModalStatus(
																					true,
																				);
																				getPowerUnitDataWithId(
																					i.id,
																				);
																				setEditedPowerUnitId(
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
								label='powerUnits'
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
											<FormGroup isFloating label='Make/Model*'>
												<Input
													id='makeModel'
													placeholder='Make/Model*'
													onChange={(e) => {
														setmakeModel(e.target.value);
													}}
													value={makeModel}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='powerUnitNumber'
												label='Power Unit Number*'>
												<Input
													disabled={isEditingPower}
													placeholder='Power Unit Number*'
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
												label='Engine Type*'>
												<Input
													disabled={isEditingPower}
													placeholder='Engine Type*'
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
													disabled={isEditingPower}
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
													disabled={isEditingPower}
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
													disabled={isEditingPower}
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
												label='License Plate*'>
												<Input
													disabled={isEditingPower}
													placeholder='License Plate*'
													onChange={(e) => {
														setlicensePlate(e.target.value);
													}}
													value={licensePlate}
												/>
											</FormGroup>

											<FormGroup isFloating id='modelYear' label='Model Year'>
												<Input
													disabled={isEditingPower}
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
													disabled={isEditingPower}
													placeholder='Vehicle ID Number'
													onChange={(e) => {
														setvehicleIdNumber(e.target.value);
													}}
													value={vehicleIdNumber}
												/>
											</FormGroup>
											<FormGroup isFloating id='assetstatus' label='Status'>
												<Input
													disabled={isEditingPower}
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
													disabled={isEditingPower}
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
													disabled={isEditingPower}
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
													disabled={isEditingPower}
													placeholder='Length'
													onChange={(e) => {
														setassetLength(e.target.value);
													}}
													value={assetLength}
												/>
											</FormGroup>
											<FormGroup isFloating id='assetWidth' label='Width'>
												<Input
													disabled={isEditingPower}
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
													disabled={isEditingPower}
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
													disabled={isEditingPower}
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
													disabled={isEditingPower}
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
													disabled={isEditingPower}
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
													disabled={isEditingPower}
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
													disabled={isEditingPower}
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
												id='purchasedOrLeased'
												label='Purchased or Leased?'>
												<Select
													disabled={isEditingPower}
													defaultValue={'Purchased'}
													placeholder='Purchased or Leased?'
													onChange={(e) => {
														setpurchasedOrLeased(e.target.value);
													}}
													value={purchasedOrLeased}>
													<Option key={1} value='Purchased'>
														Purchased
													</Option>
													<Option key={2} value='Leased'>
														Leased
													</Option>
												</Select>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='purchasedOrLeasedFrom'
												label='Purchased/Leased From'>
												<Input
													disabled={isEditingPower}
													placeholder='Purchased/Leased From'
													onChange={(e) => {
														setpurchasedOrLeasedFrom(e.target.value);
													}}
													value={purchasedOrLeasedFrom}
												/>
											</FormGroup>
											<FormGroup isFloating id='soldTo' label='Sold To'>
												<Input
													disabled={isEditingPower}
													placeholder='Sold To'
													onChange={(e) => {
														setsoldTo(e.target.value);
													}}
													value={soldTo}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='purchasedOrLeasedDate'
												label='Purchase/Lease Date'>
												<Input
													disabled={isEditingPower}
													type='date'
													placeholder='Purchase/Lease Date'
													onChange={(e) => {
														setpurchasedOrLeasedDate(e.target.value);
													}}
													value={purchasedOrLeasedDate}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='soldOrLeaseEndDate'
												label='Sold Date/Lease End Date'>
												<Input
													disabled={isEditingPower}
													type='date'
													placeholder='Sold Date/Lease End Date'
													onChange={(e) => {
														setsoldOrLeaseEndDate(e.target.value);
													}}
													value={soldOrLeaseEndDate}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='purchaseLeaseAmount'
												label='Purchase/Lease Amount'>
												<Input
													disabled={isEditingPower}
													placeholder='Purchase/Lease Amount'
													onChange={(e) => {
														setpurchaseLeaseAmount(e.target.value);
													}}
													value={purchaseLeaseAmount}
												/>
											</FormGroup>

											<FormGroup
												isFloating
												id='soldAmount'
												label='Sold Amount'>
												<Input
													disabled={isEditingPower}
													placeholder='Sold Amount'
													onChange={(e) => {
														setsoldAmount(e.target.value);
													}}
													value={soldAmount}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='factoryPrice'
												label='Factory Price'>
												<Input
													disabled={isEditingPower}
													placeholder='Factory Price'
													onChange={(e) => {
														setfactoryPrice(e.target.value);
													}}
													value={factoryPrice}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='currentValue'
												label='Current Value'>
												<Input
													disabled={isEditingPower}
													placeholder='Current Value'
													onChange={(e) => {
														setcurrentValue(e.target.value);
													}}
													value={currentValue}
												/>
											</FormGroup>
										</div>
									</div>
								</CardBody>
							</Card>
							<Card className='rounded-1 mb-0'>
								<CardHeader>
									<CardLabel icon='ReceiptLong'>
										<CardTitle>Maintenance and Safety</CardTitle>
									</CardLabel>
								</CardHeader>
								<CardBody>
									<div className='row g-4'>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='licensePlateExpiration'
												label='License Plate Expiration'>
												<Input
													disabled={isEditingPower}
													type='date'
													placeholder='License Plate Expiration'
													onChange={(e) => {
														setlicensePlateExpiration(e.target.value);
													}}
													value={licensePlateExpiration}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='inspectionExpiration'
												label='Inspection Expiration'>
												<Input
													disabled={isEditingPower}
													type='date'
													placeholder='Inspection Expiration'
													onChange={(e) => {
														setinspectionExpiration(e.target.value);
													}}
													value={inspectionExpiration}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='dotExpiration'
												label='DOT Expiration'>
												<Input
													disabled={isEditingPower}
													type='date'
													placeholder='DOT Expiration'
													onChange={(e) => {
														setdotExpiration(e.target.value);
													}}
													value={dotExpiration}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='registrationExpiration'
												label='Registration Expiration'>
												<Input
													disabled={isEditingPower}
													type='date'
													placeholder='Registration Expiration'
													onChange={(e) => {
														setregistrationExpiration(e.target.value);
													}}
													value={registrationExpiration}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='insuranceExpiration'
												label='Insurance Expiration'>
												<Input
													disabled={isEditingPower}
													type='date'
													placeholder='Insurance Expiration'
													onChange={(e) => {
														setinsuranceExpiration(e.target.value);
													}}
													value={insuranceExpiration}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='estOdometerReading'
												label='Est. Odometer Reading'>
												<Input
													disabled={isEditingPower}
													placeholder='Est. Odometer Reading'
													onChange={(e) => {
														setestOdometerReading(e.target.value);
													}}
													value={estOdometerReading}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='lastOilChangeDate'
												label='Last Oil Change Date'>
												<Input
													disabled={isEditingPower}
													type='date'
													placeholder='Last Oil Change Date'
													onChange={(e) => {
														setlastOilChangeDate(e.target.value);
													}}
													value={lastOilChangeDate}
												/>
											</FormGroup>

											<FormGroup
												isFloating
												id='lastOilChangeMileage'
												label='Last Oil Change Mileage'>
												<Input
													disabled={isEditingPower}
													placeholder='Last Oil Change Mileage'
													onChange={(e) => {
														setlastOilChangeMileage(e.target.value);
													}}
													value={lastOilChangeMileage}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='lastTuneUpDate'
												label='Last Tune-up Date'>
												<Input
													disabled={isEditingPower}
													type='date'
													placeholder='Last Tune-up Date'
													onChange={(e) => {
														setlastTuneUpDate(e.target.value);
													}}
													value={lastTuneUpDate}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='lastTuneUpMileage'
												label='Last Tune-up Mileage'>
												<Input
													disabled={isEditingPower}
													placeholder='Last Tune-up Mileage'
													onChange={(e) => {
														setlastTuneUpMileage(e.target.value);
													}}
													value={lastTuneUpMileage}
												/>
											</FormGroup>
										</div>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='lastServiceDate'
												label='Last Service Date'>
												<Input
													disabled={isEditingPower}
													type='date'
													placeholder='Last Service Date'
													onChange={(e) => {
														setlastServiceDate(e.target.value);
													}}
													value={lastServiceDate}
												/>
											</FormGroup>
											<FormGroup
												isFloating
												id='lastServiceMileage'
												label='Last Service Mileage'>
												<Input
													disabled={isEditingPower}
													placeholder='Last Service Mileage'
													onChange={(e) => {
														setlastServiceMileage(e.target.value);
													}}
													value={lastServiceMileage}
												/>
											</FormGroup>
										</div>
									</div>
								</CardBody>
							</Card>
							<Card className='rounded-1 mb-0'>
								<CardHeader>
									<CardLabel icon='ReceiptLong'>
										<CardTitle>Integration Ids</CardTitle>
									</CardLabel>
								</CardHeader>
								<CardBody>
									<div className='row g-4'>
										<div className='col-md-6'>
											<FormGroup
												isFloating
												id='keepTruckinVehicleId'
												label='KeepTruckin Vehicle Id'>
												<Input
													disabled={isEditingPower}
													placeholder='KeepTruckin Vehicle Id'
													onChange={(e) => {
														setkeepTruckinVehicleId(e.target.value);
													}}
													value={keepTruckinVehicleId}
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
					{!isEditingPower ? (
						<Button color='info' onClick={addNewPowerUnit}>
							{' '}
							{isLoading && <Spinner isSmall inButton isGrow />}
							Save
						</Button>
					) : (
						<Button
							color='info'
							onClick={(e) => {
								saveEditedPowerUnit(editedPowerUnitId);
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
