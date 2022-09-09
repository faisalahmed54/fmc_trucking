// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable prettier/prettier */
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable react/prop-types */
import React, { FC, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { useLocation, useNavigate } from 'react-router-dom';
import Card, {
	CardBody,
	CardFooter,
	CardFooterLeft,
	CardFooterRight,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../../components/bootstrap/Card';
import Button from '../../components/bootstrap/Button';
import Wizard, { WizardItem } from '../../components/Wizard';
import FormGroup from '../../components/bootstrap/forms/FormGroup';
import Input from '../../components/bootstrap/forms/Input';
import Select from '../../components/bootstrap/forms/Select';
import Label from '../../components/bootstrap/forms/Label';
import Checks, { ChecksGroup } from '../../components/bootstrap/forms/Checks';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import SubHeader, {
	SubHeaderLeft,
	SubHeaderRight,
	SubheaderSeparator,
} from '../../layout/SubHeader/SubHeader';
import Avatar from '../../components/Avatar';
import User1Webp from '../../assets/img/wanna/wanna2.webp';
import User1Img from '../../assets/img/wanna/wanna2.png';
import CommonMyWallet from './../common/CommonMyWallet';
import editPasswordValidate from './../presentation/demo-pages/helper/editPasswordValidate';
import showNotification from '../../components/extras/showNotification';
import Icon from '../../components/icon/Icon';
import { demoPages } from '../../menu';
import Option from '../../components/bootstrap/Option';
import Textarea from '../../components/bootstrap/forms/Textarea';
import { firestoredb } from '../../firebase';
import { Award } from '../../components/icon/bootstrap';

import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import Spinner from '../../components/bootstrap/Spinner';

const PreviewItem = (props) => {
	return (
		<>
			<div className='col-3 text-end'>{props.title}</div>
			<div className='col-9 fw-bold'>{props.value || '-'}</div>
		</>
	);
};

const validate = (values) => {
	const errors = {
		loadStatus: '',
		lastName: '',
		displayName: '',
		emailAddress: '',
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
		addressLine: '',
		addressLine2: '',
		phoneNumber: '',
		city: '',
		state: '',
		zip: '',
		emailNotification: [],
		pushNotification: [],
	};
	if (!values.loadStatus) {
		errors.loadStatus = 'Required';
	} else if (values.loadStatus.length < 3) {
		errors.loadStatus = 'Must be 3 characters or more';
	} else if (values.loadStatus.length > 20) {
		errors.loadStatus = 'Must be 20 characters or less';
	}

	if (!values.lastName) {
		errors.lastName = 'Required';
	} else if (values.lastName.length < 3) {
		errors.lastName = 'Must be 3 characters or more';
	} else if (values.lastName.length > 20) {
		errors.lastName = 'Must be 20 characters or less';
	}

	if (!values.displayName) {
		errors.displayName = 'Required';
	} else if (values.displayName.length > 30) {
		errors.displayName = 'Must be 20 characters or less';
	}

	if (!values.emailAddress) {
		errors.emailAddress = 'Required';
	} else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.emailAddress)) {
		errors.emailAddress = 'Invalid email address';
	}

	if (values.currentPassword) {
		if (!values.newPassword) {
			errors.newPassword = 'Please provide a valid password.';
		} else {
			errors.newPassword = '';

			if (values.newPassword.length < 8 || values.newPassword.length > 32) {
				errors.newPassword +=
					'The password must be at least 8 characters long, but no more than 32. ';
			}
			if (!/[0-9]/g.test(values.newPassword)) {
				errors.newPassword +=
					'Require that at least one digit appear anywhere in the string. ';
			}
			if (!/[a-z]/g.test(values.newPassword)) {
				errors.newPassword +=
					'Require that at least one lowercase letter appear anywhere in the string. ';
			}
			if (!/[A-Z]/g.test(values.newPassword)) {
				errors.newPassword +=
					'Require that at least one uppercase letter appear anywhere in the string. ';
			}
			if (!/[!@#$%^&*)(+=._-]+$/g.test(values.newPassword)) {
				errors.newPassword +=
					'Require that at least one special character appear anywhere in the string. ';
			}
		}

		if (!values.confirmPassword) {
			errors.confirmPassword = 'Please provide a valid password.';
		} else if (values.newPassword !== values.confirmPassword) {
			errors.confirmPassword = 'Passwords do not match.';
		}
	}

	return errors;
};
const loadStatusesObj = {
	1: 'Pending',
	2: 'Needs Carrier',
	3: 'Needs Driver',
	4: 'Booked-Awaiting',
	5: 'Ready - Confirmation Signed',
	6: 'Driver Assigned',
	7: 'Dispatched',
	8: 'In Transit',
	9: 'Watch',
	10: 'Possible Claim',
	11: 'Delivered',
	12: 'Completed',
	13: 'To Be Billed',
	14: 'Actual Claim',
};
const EditLoad = () => {
	const location = useLocation();

	const navigate = useNavigate();
	const [customerData, setCustomerData] = useState([]);
	const [carrierData, setCarrierData] = useState([]);
	const [loaderData, setLoaderData] = useState();
	const [isLoading, setisLoading] = useState(false);
	const [count, setCount] = useState();

	const TABS = {
		ACCOUNT_DETAIL: 'Load Details',
		PASSWORD: 'Password',
		MY_WALLET: 'My Wallet',
		CUSTOMER_INFO: 'Customer Info',
		CARRIER_INFO: 'Carrier Info',
	};
	const [activeTab, setActiveTab] = useState(TABS.ACCOUNT_DETAIL);

	const notificationTypes = [
		{ id: 1, name: 'New Order' },
		{ id: 2, name: 'New Customer' },
		{ id: 3, name: 'Order Status' },
	];

	const formik = useFormik({
		initialValues: {
			//load info
			loadStatus: '',
			truckStatus: '',
			loaderBranch: '',
			commodity: '',
			loadReference: '',
			declaredLoad: '',
			weight: '',
			loadSize: '',
			goods: '',
			equipmentType: '',
			equipmentLength: '',
			temperature: '',
			containerNumber: '',
			lastFreeDay: '',
			publicLoadNote: '',
			privateLoadNote: '',
			loadPostingComments: '',
			//load info end

			//customer info
			getCustomer: '',
			customerAddress: '',
			docketNumber: '',
			usdotNumber: '',
			creditLimit: '',
			availableCredit: '',
			customerLoadNotes: '',
			contactPhone: '',
			contactEmail: '',
			//customer info end

			//Carrier info
			getCarrierCustomer: '',
			carrierAddress: '',
			carrierdocketNumber: '',
			carrierusdotNumber: '',
			carrierPrimaryContact: '',
			customerCarrierLoadNotes: '',
			carriercontactPhone: '',
			carriercontactEmail: '',
			carrierDriver: '',
			getPowerUnit: '',
			getTrailer: '',
			//Carrier info end

			lastName: 'Doe',
			displayName: 'johndoe',
			emailAddress: 'johndoe@site.com',
			phoneNumber: '',
			addressLine: '',
			addressLine2: '',
			city: '',
			state: '',
			zip: '',
			emailNotification: ['2'],
			pushNotification: ['1', '2', '3'],
		},
		validate,
		onSubmit: () => {
			console.log('show');

			showNotification(
				<span className='d-flex align-items-center'>
					<Icon icon='Info' size='lg' className='me-1' />
					<span>Updated Successfully</span>
				</span>,
				"The user's account details have been successfully updated.",
			);
		},
	});

	const formikPassword = useFormik({
		initialValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
		validate: editPasswordValidate,
		onSubmit: () => {
			showNotification(
				<span className='d-flex align-items-center'>
					<Icon icon='Info' size='lg' className='me-1' />
					<span>Updated Successfully</span>
				</span>,
				"The user's password have been successfully updated.",
			);
		},
	});
	const saveLoadToDatabase = async () => {
		const result = location.pathname.split(/[.\-&=/_]/);
		if (isLoading == true) {
			showNotification(
				<span className='d-flex align-items-center'>
					<Icon color='danger' size='lg' className='me-1' />
					<span>Alert!</span>
				</span>,
				'Please wait!',
			);
		} else {
			setisLoading(true);
			let loadInformation = {
				truckStatus: formik.values.truckStatus,
				loadStatus: formik.values.loadStatus,
				loaderBranch: formik.values.loaderBranch,
				commodity: formik.values.commodity,
				loadReference: formik.values.loadReference,
				declaredLoad: formik.values.declaredLoad,
				weight: formik.values.weight,
				loadSize: formik.values.loadSize,
				goods: formik.values.goods,
				equipmentType: formik.values.equipmentType,
				equipmentLength: formik.values.equipmentLength,
				temperature: formik.values.temperature,
				containerNumber: formik.values.containerNumber,
				lastFreeDay: formik.values.lastFreeDay,
				publicLoadNote: formik.values.publicLoadNote,
				privateLoadNote: formik.values.privateLoadNote,
				loadPostingComments: formik.values.loadPostingComments,
			};
			let customerInformation = {
				getCustomer: formik.values.getCustomer,
				customerAddress: formik.values.customerAddress,
				docketNumber: formik.values.docketNumber,
				usdotNumber: formik.values.usdotNumber,
				creditLimit: formik.values.creditLimit,
				availableCredit: formik.values.availableCredit,
				customerLoadNotes: formik.values.customerLoadNotes,
				contactPhone: formik.values.contactPhone,
				contactEmail: formik.values.contactEmail,
			};
			let carrierInformation = {
				getCarrierCustomer: formik.values.getCarrierCustomer,
				carrierAddress: formik.values.carrierAddress,
				carrierdocketNumber: formik.values.carrierdocketNumber,
				carrierusdotNumber: formik.values.carrierusdotNumber,
				carrierPrimaryContact: formik.values.carrierPrimaryContact,
				customerCarrierLoadNotes: formik.values.customerCarrierLoadNotes,
				carriercontactPhone: formik.values.carriercontactPhone,
				carriercontactEmail: formik.values.carriercontactEmail,
				carrierDriver: formik.values.carrierDriver,
				getPowerUnit: formik.values.getPowerUnit,
				getTrailer: formik.values.getTrailer,
			};

			let loaderInfo = {
				loadInformation: loadInformation,
				customerInformation: customerInformation,
				carrierInformation: carrierInformation,
			};
			// Edit and save document in collection "Loaders"
			await setDoc(doc(firestoredb, 'Loaders', result[4]), loaderInfo)
				.then(async (docRef) => {
					console.log('Document has been added successfully');
					console.log(docRef);
					setisLoading(false);
				})
				.catch((error) => {
					setisLoading(false);

					console.log(error);
				});
		}
	};
	//Handlers

	const getCustomerData = async () => {
		const q = query(collection(firestoredb, 'customers'));
		const querySnapshot = await getDocs(q);
		if (querySnapshot.docs.length < 1) {
			console.log('No Data');
		} else {
			setCustomerData([]);
			querySnapshot.forEach((docRef) => {
				// console.log(docRef.data());

				setCustomerData((prev) => [...prev, { id: docRef.id, data: docRef.data() }]);
			});
		}
	};
	const getCarrierData = async () => {
		const q = query(collection(firestoredb, 'Carriers'));
		const querySnapshot = await getDocs(q);
		if (querySnapshot.docs.length < 1) {
			console.log('No Data');
		} else {
			setCarrierData([]);
			querySnapshot.forEach((docRef) => {
				console.log(docRef.data());

				setCarrierData((prev) => [...prev, { id: docRef.id, data: docRef.data() }]);
			});
		}
	};
	const getLoaderData = async () => {
		const result = location.pathname.split(/[.\-&=/_]/);
		console.log(result[4]);
		const docRef = doc(firestoredb, 'Loaders', result[4]);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			console.log('Document data:', docSnap.data());
			setLoaderData({ id: docSnap.id, data: docSnap.data() });
		} else {
			// doc.data() will be undefined in this case
			console.log('No such document!');
		}
	};
	useEffect(() => {
		setisLoading(true);
		getCustomerData();
		getCarrierData();
		getLoaderData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		if (loaderData) {
			setCount(1);
			console.log(loaderData);
			//Carrier Information
			formik.values.getCarrierCustomer =
				loaderData.data.carrierInformation.getCarrierCustomer;
			formik.values.carrierAddress = loaderData.data.carrierInformation.carrierAddress;
			formik.values.carrierdocketNumber =
				loaderData.data.carrierInformation.carrierdocketNumber;
			formik.values.carrierusdotNumber =
				loaderData.data.carrierInformation.carrierusdotNumber;
			formik.values.carrierPrimaryContact =
				loaderData.data.carrierInformation.carrierPrimaryContact;
			formik.values.customerCarrierLoadNotes =
				loaderData.data.carrierInformation.customerCarrierLoadNotes;
			formik.values.carriercontactPhone =
				loaderData.data.carrierInformation.carriercontactPhone;
			formik.values.carriercontactEmail =
				loaderData.data.carrierInformation.carriercontactEmail;
			formik.values.carrierDriver = loaderData.data.carrierInformation.carrierDriver;
			formik.values.getPowerUnit = loaderData.data.carrierInformation.getPowerUnit;
			formik.values.getTrailer = loaderData.data.carrierInformation.getTrailer;

			//Customer Information
			formik.values.getCustomer = loaderData.data.customerInformation.getCustomer;
			formik.values.customerAddress = loaderData.data.customerInformation.customerAddress;
			formik.values.docketNumber = loaderData.data.customerInformation.docketNumber;
			formik.values.usdotNumber = loaderData.data.customerInformation.usdotNumber;
			formik.values.creditLimit = loaderData.data.customerInformation.creditLimit;
			formik.values.availableCredit = loaderData.data.customerInformation.availableCredit;
			formik.values.customerLoadNotes = loaderData.data.customerInformation.customerLoadNotes;
			formik.values.contactPhone = loaderData.data.customerInformation.contactPhone;
			formik.values.contactEmail = loaderData.data.customerInformation.contactEmail;

			//Loader Information
			formik.values.truckStatus = loaderData.data.loadInformation.truckStatus;
			formik.values.loadStatus = loaderData.data.loadInformation.loadStatus;
			formik.values.loaderBranch = loaderData.data.loadInformation.loaderBranch;
			formik.values.commodity = loaderData.data.loadInformation.commodity;
			formik.values.loadReference = loaderData.data.loadInformation.loadReference;
			formik.values.declaredLoad = loaderData.data.loadInformation.declaredLoad;
			formik.values.weight = loaderData.data.loadInformation.weight;
			formik.values.loadSize = loaderData.data.loadInformation.loadSize;
			formik.values.goods = loaderData.data.loadInformation.goods;
			formik.values.equipmentType = loaderData.data.loadInformation.equipmentType;
			formik.values.equipmentLength = loaderData.data.loadInformation.equipmentLength;
			formik.values.temperature = loaderData.data.loadInformation.temperature;
			formik.values.containerNumber = loaderData.data.loadInformation.containerNumber;
			formik.values.lastFreeDay = loaderData.data.loadInformation.lastFreeDay;
			formik.values.publicLoadNote = loaderData.data.loadInformation.publicLoadNote;
			formik.values.privateLoadNote = loaderData.data.loadInformation.privateLoadNote;
			formik.values.loadPostingComments = loaderData.data.loadInformation.loadPostingComments;

			setisLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loaderData]);
	return (
		<PageWrapper title={demoPages.editPages.subMenu.editWizard.text}>
			<SubHeader>
				<SubHeaderLeft>
					<Button
						color='info'
						isLink
						icon='ArrowBack'
						onClick={() => navigate('/loads/view-load')}>
						Back to List
					</Button>
					{/* <SubheaderSeparator /> */}
					{/* <Avatar srcSet={User1Webp} src={User1Img} size={32} />
					<span>
						<strong>Timothy J. Doe</strong>
					</span>
					<span className='text-muted'>Edit User</span> */}
				</SubHeaderLeft>
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
				<div className='row h-100 pb-3'>
					<div className='col-lg-4 col-md-6'>
						<Card stretch>
							<CardHeader>
								<CardLabel icon='AccountCircle'>
									<CardTitle>User Information</CardTitle>
								</CardLabel>
							</CardHeader>
							<CardBody isScrollable>
								<div className='row g-3'>
									<div className='col-12'>
										<Button
											icon='Contacts'
											color='info'
											className='w-100 p-3'
											isLight={TABS.ACCOUNT_DETAIL !== activeTab}
											onClick={() => setActiveTab(TABS.ACCOUNT_DETAIL)}>
											{TABS.ACCOUNT_DETAIL}
										</Button>
									</div>
									<div className='col-12'>
										<Button
											icon='Contacts'
											color='info'
											className='w-100 p-3'
											isLight={TABS.CUSTOMER_INFO !== activeTab}
											onClick={() => setActiveTab(TABS.CUSTOMER_INFO)}>
											{TABS.CUSTOMER_INFO}
										</Button>
									</div>
									<div className='col-12'>
										<Button
											icon='Contacts'
											color='info'
											className='w-100 p-3'
											isLight={TABS.CARRIER_INFO !== activeTab}
											onClick={() => setActiveTab(TABS.CARRIER_INFO)}>
											{TABS.CARRIER_INFO}
										</Button>
									</div>
									{/* <div className='col-12'>
										<Button
											icon='LocalPolice'
											color='info'
											className='w-100 p-3'
											isLight={TABS.PASSWORD !== activeTab}
											onClick={() => setActiveTab(TABS.PASSWORD)}>
											{TABS.PASSWORD}
										</Button>
									</div>
									<div className='col-12'>
										<Button
											icon='Style'
											color='info'
											className='w-100 p-3'
											isLight={TABS.MY_WALLET !== activeTab}
											onClick={() => setActiveTab(TABS.MY_WALLET)}>
											{TABS.MY_WALLET}
										</Button>
									</div> */}
								</div>
							</CardBody>
							<CardFooter>
								<CardFooterLeft className='w-100'>
									<Button
										type='submit'
										onClick={saveLoadToDatabase}
										icon='Save'
										color='primary'
										isLight
										className='w-100 p-3'>
										Save Loads
									</Button>
									{/* <Button
										icon='Delete'
										color='danger'
										isLight
										className='w-100 p-3'>
										Delete User
									</Button> */}
								</CardFooterLeft>
							</CardFooter>
						</Card>
					</div>
					<div className='col-lg-8 col-md-6'>
						{TABS.ACCOUNT_DETAIL === activeTab && (
							<Wizard
								isHeader
								stretch
								color='info'
								noValidate
								onSubmit={formik.handleSubmit}
								className='shadow-3d-info'>
								<WizardItem id='step1' title='Account Detail'>
									<Card>
										<CardHeader>
											<CardLabel icon='Edit' iconColor='warning'>
												<CardTitle>Load Information</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody className='pt-0'>
											<div className='row g-4'>
												<div className='col-md-6'>
													<FormGroup
														id='loadStatus'
														label='Load Status'
														isFloating>
														<Select
															ariaLabel='Board select'
															placeholder='Select group'
															onChange={formik.handleChange}
															value={formik.values.loadStatus}
															isValid={formik.isValid}
															isTouched={formik.touched.loadStatus}
															invalidFeedback={
																formik.errors.loadStatus
															}>
															<optgroup label='1. Planning'>
																<Option value='Pending'>
																	Pending
																</Option>
																<Option value='Needs Carrier'>
																	Needs Carrier
																</Option>
																<Option value='Needs Driver'>
																	Needs Driver
																</Option>
																<Option value='Booked - Awaiting Confirmation'>
																	Booked - Awaiting Confirmation
																</Option>
															</optgroup>
															<optgroup label='2. Active Load'>
																<Option value='Ready - Confirmation Signed'>
																	Ready - Confirmation Signed
																</Option>
																<Option value='Driver Assigned'>
																	Driver Assigned
																</Option>
																<Option value='Dispatched'>
																	Dispatched
																</Option>
																<Option value='In Transit'>
																	In Transit
																</Option>
																<Option value='Watch'>Watch</Option>
																<Option value='Possible Claim'>
																	Possible Claim
																</Option>
																<Option value='Delivered'>
																	Delivered
																</Option>
															</optgroup>
															<optgroup label='3. Load Completed'>
																<Option value='Completed'>
																	Completed
																</Option>
																<Option value='To Be Billed'>
																	To Be Billed
																</Option>
																<Option value='Actual Claim'>
																	Actual Claim
																</Option>
															</optgroup>
															{/* {Object.keys(loadStatusesObj).map(
																(u) => (
																	// @ts-ignore
																	<Option
																		key={loadStatusesObj[u]}
																		value={loadStatusesObj[u]}>
																		{
																			// @ts-ignore
																			`${loadStatusesObj[u]}`
																		}
																	</Option>
																),
															)} */}
														</Select>
													</FormGroup>
													<FormGroup
														id='truckStatus'
														label='Truck Status'
														isFloating>
														<Select
															ariaLabel='Board select'
															placeholder='Select group'
															onChange={formik.handleChange}
															value={formik.values.truckStatus}
															isValid={formik.isValid}
															isTouched={formik.touched.truckStatus}
															invalidFeedback={
																formik.errors.truckStatus
															}>
															<optgroup label='1. Carrier Setup'>
																<Option value='Carrier Needs Setup'>
																	Carrier Needs Setup
																</Option>
																<Option value='Setup Packet Sent To Carrier'>
																	Setup Packet Sent To Carrier
																</Option>
																<Option value='Insurance Verification Needed'>
																	Insurance Verification Needed
																</Option>
																<Option value='Carrier Setup Not Complete'>
																	Carrier Setup Not Complete
																</Option>
																<Option value='Carrier Setup Complete'>
																	Carrier Setup Complete
																</Option>
															</optgroup>
															<optgroup label='2. Before Your Load'>
																<Option value='At Prior Load'>
																	At Prior Load
																</Option>
																<Option value='Dispatched'>
																	Dispatched
																</Option>
															</optgroup>
															<optgroup label='3. During Your Load'>
																<Option value='At Pickup - Waiting'>
																	At Pickup - Waiting
																</Option>
																<Option value='At Pickup - Loading'>
																	At Pickup - Loading
																</Option>
																<Option value='On Time'>
																	On Time
																</Option>
																<Option value='Running Late'>
																	Running Late
																</Option>
																<Option value='At Delivery - Waiting'>
																	At Delivery - Waiting
																</Option>
																<Option value='At Delivery - Unloading'>
																	At Delivery - Unloading
																</Option>
																<Option value='Broken Down'>
																	Broken Down
																</Option>
																<Option value='In Accident'>
																	In Accident
																</Option>
															</optgroup>
															<optgroup label='4. After Your Load'>
																<Option value='Empty'>Empty</Option>
																<Option value='Driver Paid'>
																	Driver Paid
																</Option>
															</optgroup>
														</Select>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='loaderBranch'
														label='Select Branch'
														isFloating>
														<Select
															ariaLabel='Board select'
															placeholder='Select Branch'
															onChange={formik.handleChange}
															value={formik.values.loaderBranch}
															isValid={formik.isValid}
															isTouched={formik.touched.loaderBranch}
															invalidFeedback={
																formik.errors.loaderBranch
															}>
															<Option key={1} value='Shared'>
																Shared
															</Option>
														</Select>
													</FormGroup>
												</div>
												<div className='col-12'>
													<FormGroup
														id='loadReference'
														label='Load Reference ID/Numbers'
														isFloating
														formText='This will be how your name will be displayed in the account section and in reviews'>
														<Textarea
															placeholder='Load Reference ID/Numbers'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.loadReference}
															isValid={formik.isValid}
															isTouched={formik.touched.loadReference}
															invalidFeedback={
																formik.errors.loadReference
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='commodity'
														label='Commodity Status'
														isFloating>
														<Select
															ariaLabel='Board select'
															placeholder='Select Commodity'
															onChange={formik.handleChange}
															value={formik.values.commodity}
															isValid={formik.isValid}
															isTouched={formik.touched.commodity}
															invalidFeedback={
																formik.errors.commodity
															}>
															<optgroup label='Dry'>
																<Option value='Dry Goods (Food)'>
																	Dry Goods (Food)
																</Option>
																<Option value='Dry Goods (General)'>
																	Dry Goods (General)
																</Option>
															</optgroup>
															<optgroup label='Hazardous'>
																<Option value='Chemicals'>
																	Chemicals
																</Option>
																<Option value='Explosives'>
																	Explosives
																</Option>
																<Option value='Firearms / Ammunition'>
																	Firearms / Ammunition
																</Option>
																<Option value='Hazardous Materials'>
																	Hazardous Materials
																</Option>
																<Option value='Oil / Petrolium'>
																	Oil / Petrolium
																</Option>
															</optgroup>
															<optgroup label='High Value'>
																<Option value='Alcohol'>
																	Alcohol
																</Option>
																<Option value='Antiques / Works of Art'>
																	Antiques / Works of Art
																</Option>
																<Option value='Cash, Checks, Currency'>
																	Cash, Checks, Currency
																</Option>
																<Option value='Consumer Electronics'>
																	Consumer Electronics
																</Option>
																<Option value='Jewelry'>
																	Jewelry
																</Option>
																<Option value='Tobacco Products'>
																	Tobacco Products
																</Option>
															</optgroup>
															<optgroup label='Liquid'>
																<Option value='Tanker Freight'>
																	Tanker Freight
																</Option>
															</optgroup>
															<optgroup label='Livestock'>
																<Option value='Live Animals'>
																	Live Animals
																</Option>
															</optgroup>
															<optgroup label='Temp. Controlled'>
																<Option value='Refrigerated (Food)'>
																	Refrigerated (Food)
																</Option>
																<Option value='Refrigerated (General)'>
																	Refrigerated (General)
																</Option>
															</optgroup>
															{/* {Object.keys(commodityObj).map((u) => (
																// @ts-ignore
																<Option
																	key={commodityObj[u]}
																	value={commodityObj[u]}>
																	{
																		// @ts-ignore
																		`${commodityObj[u]}`
																	}
																</Option>
															))} */}
														</Select>
													</FormGroup>
													<FormGroup
														id='weight'
														label='Weight in lbs'
														isFloating>
														<Input
															placeholder='Weight in lbs'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.weight}
															isValid={formik.isValid}
															isTouched={formik.touched.weight}
															invalidFeedback={formik.errors.weight}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-4'>
													<FormGroup
														id='declaredLoad'
														label='Declared Load Value'
														isFloating>
														<Input
															placeholder='Declared Load Value'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.declaredLoad}
															isValid={formik.isValid}
															isTouched={formik.touched.declaredLoad}
															invalidFeedback={
																formik.errors.declaredLoad
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
													<FormGroup
														id='loadSize'
														label='Load Size'
														isFloating>
														<Select
															ariaLabel='Board select'
															placeholder='Select Load Size'
															onChange={formik.handleChange}
															value={formik.values.loadSize}
															isValid={formik.isValid}
															isTouched={formik.touched.loadSize}
															invalidFeedback={
																formik.errors.loadSize
															}>
															<Option key={1} value='Full Load'>
																Full Load
															</Option>
															<Option key={2} value='Partial Load'>
																Partial Load
															</Option>
														</Select>
													</FormGroup>

													<FormGroup
														id='goods'
														label='New or Used Goods'
														isFloating>
														<Select
															ariaLabel='Board select'
															placeholder='Select New or Used Goods'
															onChange={formik.handleChange}
															value={formik.values.goods}
															isValid={formik.isValid}
															isTouched={formik.touched.goods}
															invalidFeedback={formik.errors.goods}>
															<Option key={1} value='New'>
																New
															</Option>
															<Option key={2} value='Used'>
																Used
															</Option>
														</Select>
													</FormGroup>
												</div>
											</div>
										</CardBody>
									</Card>

									<Card className='mb-0'>
										<CardHeader>
											<CardLabel icon='MarkunreadMailbox' iconColor='success'>
												<CardTitle>Equipment Information</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody className='pt-0'>
											<div className='row g-4'>
												<div className='col-12'>
													<FormGroup
														id='equipmentType'
														label='Equipment Type'
														isFloating>
														<Select
															ariaLabel='Board select'
															placeholder='Select Equipment Type'
															onChange={formik.handleChange}
															value={formik.values.equipmentType}
															isValid={formik.isValid}
															isTouched={formik.touched.equipmentType}
															invalidFeedback={
																formik.errors.equipmentType
															}>
															<optgroup label='1. Dry Van'>
																<Option value='Van'>Van</Option>
																<Option value='Van - Air-Ride'>
																	Van - Air-Ride
																</Option>
																<Option value='Van - Hazardous'>
																	Van - Hazardous
																</Option>
																<Option value='Van - Vented'>
																	Van - Vented
																</Option>
																<Option value='Van w/ Curtains'>
																	Van w/ Curtains
																</Option>
																<Option value='Van w/ Pallet Exchange'>
																	Van w/ Pallet Exchange
																</Option>
															</optgroup>
															<optgroup label='2. Temp. Control'>
																<Option value='Reefer'>
																	Reefer
																</Option>
																<Option value='Reefer - Hazardous'>
																	Reefer - Hazardous
																</Option>
																<Option value='Reefer w/ Pallet Exchange'>
																	Reefer w/ Pallet Exchange
																</Option>
															</optgroup>
															<optgroup label='3. Flatbed'>
																<Option value='Double Drop'>
																	Double Drop
																</Option>
																<Option value='Flatbed'>
																	Flatbed
																</Option>
																<Option value='Flatbed - Hazardous'>
																	Flatbed - Hazardous
																</Option>
																<Option value='Flatbed w/ Pallet Exchange'>
																	Flatbed w/ Pallet Exchange
																</Option>
																<Option value='Flatbed w/ Sides'>
																	Flatbed w/ Sides
																</Option>
																<Option value='Lowboy'>
																	Lowboy
																</Option>
																<Option value='Maxi'>Maxi</Option>
																<Option value='Removable Gooseneck'>
																	Removable Gooseneck
																</Option>
																<Option value='Step Deck'>
																	Step Deck
																</Option>
															</optgroup>
															<optgroup label='4. Specialized'>
																<Option value='Auto Carrier'>
																	Auto Carrier
																</Option>
																<Option value='Dump Trailer'>
																	Dump Trailer
																</Option>
																<Option value='Hopper Bottom'>
																	Hopper Bottom
																</Option>
																<Option value='Hotshot'>
																	Hotshot
																</Option>
																<Option value='Tanker'>
																	Tanker
																</Option>
															</optgroup>
															<optgroup label='5. Flexible Type'>
																<Option value='Flatbed/Step Deck'>
																	Flatbed/Step Deck
																</Option>
																<Option value='Flatbed/Van'>
																	Flatbed/Van
																</Option>
																<Option value='Flatbed/Reefer'>
																	Flatbed/Reefer
																</Option>
																<Option value='Reefer/Van'>
																	Reefer/Van
																</Option>
																<Option value='Flatbed/Reefer/Van'>
																	Flatbed/Reefer/Van
																</Option>
															</optgroup>
															<optgroup label='Misc.'>
																<Option value='Power Only'>
																	Power Only
																</Option>
															</optgroup>
															{/* {Object.keys(commodityObj).map((u) => (
																// @ts-ignore
																<Option
																	key={commodityObj[u]}
																	value={commodityObj[u]}>
																	{
																		// @ts-ignore
																		`${commodityObj[u]}`
																	}
																</Option>
															))} */}
														</Select>
													</FormGroup>
												</div>
												<div className='col-12'>
													<FormGroup
														id='equipmentLength'
														label='Equipment Length'
														isFloating>
														<Select
															ariaLabel='Board select'
															placeholder='Select Equipment Length'
															onChange={formik.handleChange}
															value={formik.values.equipmentLength}
															isValid={formik.isValid}
															isTouched={
																formik.touched.equipmentLength
															}
															invalidFeedback={
																formik.errors.equipmentLength
															}>
															<optgroup label='1. Small Truck'>
																<Option value="20'">20'</Option>
																<Option value="28'">28'</Option>
															</optgroup>
															<optgroup label='2. Medium Truck'>
																<Option value="40'">40'</Option>
																<Option value="45'">45'</Option>
															</optgroup>
															<optgroup label='3. Large Truck'>
																<Option value="48'">48'</Option>
																<Option value="53'">53'</Option>
															</optgroup>
														</Select>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='temperature'
														label='Temperature'
														isFloating>
														<Input
															placeholder='Temperature'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.temperature}
															isValid={formik.isValid}
															isTouched={formik.touched.temperature}
															invalidFeedback={
																formik.errors.temperature
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='containerNumber'
														label='Intermodal/Dray Container Number'
														isFloating>
														<Input
															placeholder='Intermodal/Dray Container Number'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.containerNumber}
															isValid={formik.isValid}
															isTouched={
																formik.touched.containerNumber
															}
															invalidFeedback={
																formik.errors.containerNumber
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='lastFreeDay'
														label='Last Free Day'
														isFloating>
														<Input
															type='date'
															placeholder='Last Free Day'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.lastFreeDay}
															isValid={formik.isValid}
															isTouched={formik.touched.lastFreeDay}
															invalidFeedback={
																formik.errors.lastFreeDay
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
											</div>
										</CardBody>
									</Card>
									<Card className='mb-0'>
										<CardHeader>
											<CardLabel icon='MarkunreadMailbox' iconColor='success'>
												<CardTitle>Load Notes</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody className='pt-0'>
											<div className='row g-4'>
												<div className='col-12'>
													<FormGroup
														id='publicLoadNote'
														label='Public Load Note'
														isFloating
														formText='* This note is public and will appear in the Load Confirmation.'>
														<Textarea
															placeholder='Public Load Note'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.publicLoadNote}
															isValid={formik.isValid}
															isTouched={
																formik.touched.publicLoadNote
															}
															invalidFeedback={
																formik.errors.publicLoadNote
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
											</div>
											<div className='col-12'>
												<FormGroup
													id='privateLoadNote'
													label='Private Load Note'
													isFloating
													formText='* This note is private and viewable only by your organization.'>
													<Textarea
														placeholder='Private Load Note'
														onChange={formik.handleChange}
														onBlur={formik.handleBlur}
														value={formik.values.privateLoadNote}
														isValid={formik.isValid}
														isTouched={formik.touched.privateLoadNote}
														invalidFeedback={
															formik.errors.privateLoadNote
														}
														validFeedback='Looks good!'
													/>
												</FormGroup>
											</div>
											<div className='col-12'>
												<FormGroup
													id='loadPostingComments'
													label='Load Posting Notes/Comments'
													isFloating
													formText='*  The text entered in this field will be sent as the load notes/comments when posted to public load sources such as Truckstop.com and 123 Loadboard.'>
													<Textarea
														placeholder='Load Posting Notes/Comments'
														onChange={formik.handleChange}
														onBlur={formik.handleBlur}
														value={formik.values.loadPostingComments}
														isValid={formik.isValid}
														isTouched={
															formik.touched.loadPostingComments
														}
														invalidFeedback={
															formik.errors.loadPostingComments
														}
														validFeedback='Looks good!'
													/>
												</FormGroup>
											</div>
										</CardBody>
									</Card>
								</WizardItem>
							</Wizard>
						)}
						{TABS.CUSTOMER_INFO === activeTab && (
							<Wizard
								isHeader
								stretch
								color='info'
								noValidate
								onSubmit={formik.handleSubmit}
								className='shadow-3d-info'>
								<WizardItem id='step1' title='Account Detail'>
									<Card>
										<CardHeader>
											<CardLabel icon='Edit' iconColor='warning'>
												<CardTitle>Customer Information</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody className='pt-0'>
											<div className='row g-4'>
												<div className='col-md-12'>
													<FormGroup
														id='getCustomer'
														label='Customer'
														isFloating>
														<Select
															ariaLabel='Board select'
															placeholder='Select Customer'
															onChange={(e) => {
																formik.handleChange(e);
																console.log(e.target.value);
																customerData.map((u) => {
																	if (u.id == e.target.value) {
																		formik.values.customerAddress =
																			u.data.addressLine1;
																		formik.values.usdotNumber =
																			u.data.usDotNumber;
																		formik.values.docketNumber =
																			u.data.mcNumber;

																		formik.values.creditLimit =
																			u.data.creditLimit;

																		formik.values.availableCredit =
																			u.data.avaliableCredit;

																		formik.values.contactPhone =
																			u.data.telephone;

																		formik.values.contactEmail =
																			u.data.customerEmail;
																		formik.values.customerLoadNotes =
																			u.data.notes;
																	}
																});
															}}
															value={formik.values.getCustomer}
															isValid={formik.isValid}
															isTouched={formik.touched.getCustomer}
															invalidFeedback={
																formik.errors.getCustomer
															}>
															{customerData &&
															customerData.length > 0 ? (
																customerData.map((u) => (
																	// @ts-ignore
																	<Option key={u.id} value={u.id}>
																		{
																			// @ts-ignore
																			`${u.data.name}`
																		}
																	</Option>
																))
															) : (
																<></>
															)}
														</Select>
													</FormGroup>
												</div>
												<div className='col-md-12'>
													<FormGroup
														id='customerAddress'
														label='Customer Address'
														isFloating>
														<Input
															disabled
															placeholder='Customer Address'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.customerAddress}
															isValid={formik.isValid}
															isTouched={
																formik.touched.customerAddress
															}
															invalidFeedback={
																formik.errors.customerAddress
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='docketNumber'
														label='Docket Number'
														isFloating>
														<Input
															disabled
															placeholder='Docket Number'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.docketNumber}
															isValid={formik.isValid}
															isTouched={formik.touched.docketNumber}
															invalidFeedback={
																formik.errors.docketNumber
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='usdotNumber'
														label='USDOT Number'
														isFloating>
														<Input
															disabled
															placeholder='USDOT Number'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.usdotNumber}
															isValid={formik.isValid}
															isTouched={formik.touched.usdotNumber}
															invalidFeedback={
																formik.errors.usdotNumber
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='creditLimit'
														label='Credit Limit'
														isFloating>
														<Input
															disabled
															placeholder='Credit Limit'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.creditLimit}
															isValid={formik.isValid}
															isTouched={formik.touched.creditLimit}
															invalidFeedback={
																formik.errors.creditLimit
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='availableCredit'
														label='Available Credit'
														isFloating>
														<Input
															disabled
															placeholder='Available Credit'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.availableCredit}
															isValid={formik.isValid}
															isTouched={
																formik.touched.availableCredit
															}
															invalidFeedback={
																formik.errors.availableCredit
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-12'>
													<FormGroup
														id='customerLoadNotes'
														label='Notes'
														formText='* This note is public and will appear on your load documents.'
														isFloating>
														<Textarea
															disabled
															placeholder='Notes'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.customerLoadNotes}
															isValid={formik.isValid}
															isTouched={
																formik.touched.customerLoadNotes
															}
															invalidFeedback={
																formik.errors.customerLoadNotes
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='contactPhone'
														label='Contact Phone'
														isFloating>
														<Input
															disabled
															placeholder='contactPhone'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.contactPhone}
															isValid={formik.isValid}
															isTouched={formik.touched.contactPhone}
															invalidFeedback={
																formik.errors.contactPhone
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='contactEmail'
														label='Contact Email'
														isFloating>
														<Input
															disabled
															placeholder='contactPhone'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.contactEmail}
															isValid={formik.isValid}
															isTouched={formik.touched.contactEmail}
															invalidFeedback={
																formik.errors.contactEmail
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
											</div>
										</CardBody>
									</Card>
								</WizardItem>
							</Wizard>
						)}
						{TABS.CARRIER_INFO === activeTab && (
							<Wizard
								isHeader
								stretch
								color='info'
								noValidate
								onSubmit={formik.handleSubmit}
								className='shadow-3d-info'>
								<WizardItem id='step1' title='Account Detail'>
									<Card>
										<CardHeader>
											<CardLabel icon='Edit' iconColor='warning'>
												<CardTitle>Carrier Information</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody className='pt-0'>
											<div className='row g-4'>
												<div className='col-md-12'>
													<FormGroup
														id='getCarrierCustomer'
														label='Carrier'
														isFloating>
														<Select
															ariaLabel='Board select'
															placeholder='Select Carrier'
															onChange={(e) => {
																formik.handleChange(e);

																carrierData.map((u) => {
																	if (u.id == e.target.value) {
																		formik.values.carrierAddress =
																			u.data.carrierAddress;
																		formik.values.carrierusdotNumber =
																			u.data.usdotNumber;
																		formik.values.carrierdocketNumber =
																			u.data.mcffmxNumber;
																		formik.values.carrierPrimaryContact =
																			u.data.telephoneOptional;
																		formik.values.customerCarrierLoadNotes =
																			u.data.privateLoadNote;
																		formik.values.carriercontactPhone =
																			u.data.telephone;
																		formik.values.carriercontactEmail =
																			u.data.email;
																	}
																});
															}}
															value={formik.values.getCarrierCustomer}
															isValid={formik.isValid}
															isTouched={
																formik.touched.getCarrierCustomer
															}
															invalidFeedback={
																formik.errors.getCarrierCustomer
															}>
															{carrierData &&
															carrierData.length > 0 ? (
																carrierData.map((u) => (
																	// @ts-ignore
																	<Option key={u.id} value={u.id}>
																		{
																			// @ts-ignore
																			`${u.data.carrierName}`
																		}
																	</Option>
																))
															) : (
																<></>
															)}
														</Select>
													</FormGroup>
												</div>
												<div className='col-md-12'>
													<FormGroup
														id='carrierAddress'
														label='Carrier Address'
														isFloating>
														<Input
															placeholder='Carrier Address'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.carrierAddress}
															isValid={formik.isValid}
															isTouched={
																formik.touched.carrierAddress
															}
															invalidFeedback={
																formik.errors.carrierAddress
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='carrierdocketNumber'
														label='Docket Number'
														isFloating>
														<Input
															disabled
															placeholder='Docket Number'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={
																formik.values.carrierdocketNumber
															}
															isValid={formik.isValid}
															isTouched={
																formik.touched.carrierdocketNumber
															}
															invalidFeedback={
																formik.errors.carrierdocketNumber
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='carrierusdotNumber'
														label='USDOT Number'
														isFloating>
														<Input
															disabled
															placeholder='USDOT Number'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.carrierusdotNumber}
															isValid={formik.isValid}
															isTouched={
																formik.touched.carrierusdotNumber
															}
															invalidFeedback={
																formik.errors.carrierusdotNumber
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='carrierPrimaryContact'
														label='Primary Contact'
														isFloating>
														<Input
															disabled
															placeholder='Primary Contact'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={
																formik.values.carrierPrimaryContact
															}
															isValid={formik.isValid}
															isTouched={
																formik.touched.carrierPrimaryContact
															}
															invalidFeedback={
																formik.errors.carrierPrimaryContact
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='availableCredit'
														label='Available Credit'
														isFloating>
														<Input
															disabled
															placeholder='Available Credit'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.availableCredit}
															isValid={formik.isValid}
															isTouched={
																formik.touched.availableCredit
															}
															invalidFeedback={
																formik.errors.availableCredit
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-12'>
													<FormGroup
														id='customerCarrierLoadNotes'
														label='Notes'
														formText='* This note is public and will appear on your load documents.'
														isFloating>
														<Textarea
															disabled
															placeholder='Notes'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={
																formik.values
																	.customerCarrierLoadNotes
															}
															isValid={formik.isValid}
															isTouched={
																formik.touched
																	.customerCarrierLoadNotes
															}
															invalidFeedback={
																formik.errors
																	.customerCarrierLoadNotes
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='carriercontactPhone'
														label='Contact Phone'
														isFloating>
														<Input
															disabled
															placeholder='contactPhone'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={
																formik.values.carriercontactPhone
															}
															isValid={formik.isValid}
															isTouched={
																formik.touched.carriercontactPhone
															}
															invalidFeedback={
																formik.errors.carriercontactPhone
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='carriercontactEmail'
														label='Contact Email'
														isFloating>
														<Input
															disabled
															placeholder='contactPhone'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={
																formik.values.carriercontactEmail
															}
															isValid={formik.isValid}
															isTouched={
																formik.touched.carriercontactEmail
															}
															invalidFeedback={
																formik.errors.carriercontactEmail
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
											</div>
										</CardBody>
									</Card>
									<Card>
										<CardHeader>
											<CardLabel icon='Edit' iconColor='warning'>
												<CardTitle>
													Driver and Equipment Information For This Load
												</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody className='pt-0'>
											<div className='row g-4'>
												<div className='col-md-12'>
													<FormGroup
														id='carrierDriver'
														label='Driver'
														isFloating>
														<Select
															ariaLabel='Board select'
															placeholder='Select Driver'
															onChange={formik.handleChange}
															value={formik.values.carrierDriver}
															isValid={formik.isValid}
															isTouched={formik.touched.carrierDriver}
															invalidFeedback={
																formik.errors.carrierDriver
															}>
															{Object.keys(loadStatusesObj).map(
																(u) => (
																	// @ts-ignore
																	<Option
																		key={loadStatusesObj[u]}
																		value={loadStatusesObj[u]}>
																		{
																			// @ts-ignore
																			`${loadStatusesObj[u]}`
																		}
																	</Option>
																),
															)}
														</Select>
													</FormGroup>
												</div>
												<div className='col-md-12'>
													<FormGroup
														id='getPowerUnit'
														label='Power Unit'
														isFloating>
														<Select
															ariaLabel='Board select'
															placeholder='Select Power Unit'
															onChange={formik.handleChange}
															value={formik.values.getPowerUnit}
															isValid={formik.isValid}
															isTouched={formik.touched.getPowerUnit}
															invalidFeedback={
																formik.errors.getPowerUnit
															}>
															{Object.keys(loadStatusesObj).map(
																(u) => (
																	// @ts-ignore
																	<Option
																		key={loadStatusesObj[u]}
																		value={loadStatusesObj[u]}>
																		{
																			// @ts-ignore
																			`${loadStatusesObj[u]}`
																		}
																	</Option>
																),
															)}
														</Select>
													</FormGroup>
												</div>{' '}
												<div className='col-md-12'>
													<FormGroup
														id='getTrailer'
														label='Trailer'
														isFloating>
														<Select
															ariaLabel='Board select'
															placeholder='Select Trailer'
															onChange={formik.handleChange}
															value={formik.values.getTrailer}
															isValid={formik.isValid}
															isTouched={formik.touched.getTrailer}
															invalidFeedback={
																formik.errors.getTrailer
															}>
															{Object.keys(loadStatusesObj).map(
																(u) => (
																	// @ts-ignore
																	<Option
																		key={loadStatusesObj[u]}
																		value={loadStatusesObj[u]}>
																		{
																			// @ts-ignore
																			`${loadStatusesObj[u]}`
																		}
																	</Option>
																),
															)}
														</Select>
													</FormGroup>
												</div>
											</div>
										</CardBody>
									</Card>
								</WizardItem>
							</Wizard>
						)}
						{TABS.PASSWORD === activeTab && (
							<Card
								stretch
								tag='form'
								noValidate
								onSubmit={formikPassword.handleSubmit}>
								<CardHeader>
									<CardLabel icon='LocalPolice' iconColor='info'>
										<CardTitle>{TABS.PASSWORD}</CardTitle>
									</CardLabel>
								</CardHeader>
								<CardBody className='pb-0' isScrollable>
									<div className='row g-4'>
										<div className='col-12'>
											<FormGroup
												id='currentPassword'
												label='Current password'
												isFloating>
												<Input
													type='password'
													placeholder='Current password'
													autoComplete='current-password'
													onChange={formikPassword.handleChange}
													value={formikPassword.values.currentPassword}
												/>
											</FormGroup>
										</div>
										<div className='col-12'>
											<FormGroup
												id='newPassword'
												label='New password'
												isFloating>
												<Input
													type='password'
													placeholder='New password'
													autoComplete='new-password'
													onChange={formikPassword.handleChange}
													onBlur={formikPassword.handleBlur}
													value={formikPassword.values.newPassword}
													isValid={formikPassword.isValid}
													isTouched={formikPassword.touched.newPassword}
													invalidFeedback={
														formikPassword.errors.newPassword
													}
													validFeedback='Looks good!'
												/>
											</FormGroup>
										</div>
										<div className='col-12'>
											<FormGroup
												id='confirmPassword'
												label='Confirm new password'
												isFloating>
												<Input
													type='password'
													placeholder='Confirm new password'
													autoComplete='new-password'
													onChange={formikPassword.handleChange}
													onBlur={formikPassword.handleBlur}
													value={formikPassword.values.confirmPassword}
													isValid={formikPassword.isValid}
													isTouched={
														formikPassword.touched.confirmPassword
													}
													invalidFeedback={
														formikPassword.errors.confirmPassword
													}
													validFeedback='Looks good!'
												/>
											</FormGroup>
										</div>
									</div>
								</CardBody>
								<CardFooter>
									<CardFooterLeft>
										<Button
											color='info'
											isLink
											type='reset'
											onClick={formikPassword.resetForm}>
											Reset
										</Button>
									</CardFooterLeft>
									<CardFooterRight>
										<Button
											type='submit'
											icon='Save'
											color='info'
											isOutline
											isDisable={
												!formikPassword.isValid &&
												!!formikPassword.submitCount
											}>
											Save
										</Button>
									</CardFooterRight>
								</CardFooter>
							</Card>
						)}
						{TABS.MY_WALLET === activeTab && <CommonMyWallet />}
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default EditLoad;
