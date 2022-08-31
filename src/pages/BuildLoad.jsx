// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable react/prop-types */
import React, { FC, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import Card, {
	CardBody,
	CardFooter,
	CardFooterLeft,
	CardFooterRight,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../components/bootstrap/Card';
import Button from '../components/bootstrap/Button';
import Wizard, { WizardItem } from '../components/Wizard';
import FormGroup from '../components/bootstrap/forms/FormGroup';
import Input from '../components/bootstrap/forms/Input';
import Select from '../components/bootstrap/forms/Select';
import Label from '../components/bootstrap/forms/Label';
import Checks, { ChecksGroup } from '../components/bootstrap/forms/Checks';
import PageWrapper from '../layout/PageWrapper/PageWrapper';
import Page from '../layout/Page/Page';
import SubHeader, {
	SubHeaderLeft,
	SubHeaderRight,
	SubheaderSeparator,
} from '../layout/SubHeader/SubHeader';
import Avatar from '../components/Avatar';
import User1Webp from '../assets/img/wanna/wanna2.webp';
import User1Img from '../assets/img/wanna/wanna2.png';
import CommonMyWallet from './common/CommonMyWallet';
import editPasswordValidate from './presentation/demo-pages/helper/editPasswordValidate';
import showNotification from '../components/extras/showNotification';
import Icon from '../components/icon/Icon';
import { demoPages } from '../menu';
import Option from '../components/bootstrap/Option';
import Textarea from '../components/bootstrap/forms/Textarea';
import { firestoredb } from '../firebase';
import { Award } from '../components/icon/bootstrap';
import { addDoc, collection, doc, getDocs, query, setDoc } from 'firebase/firestore';

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
const truckStatusesObj = {
	1: 'Carrier Needs Setup',
	2: 'Setup Packet Sent to Carrier',
	3: 'Insurance Verfication Needed',
	4: 'Carrier Setup Not Complete',
	5: 'Carrier Setup Complete',
	6: 'At Prior Load',
	7: 'Dispatched',
	8: 'At Pickup - Waiting',
	9: 'At Pickup - Loading',
	10: 'On Time',
	11: 'Running Late',
	12: 'At Delivery - Waiting',
	13: 'At Delivery - Unloading',
	14: 'Broken Down',
	15: 'In Accident',
	16: 'Empty',
	17: 'Driver Paid',
};
const commodityObj = {
	1: 'Dry Goods (Food)',
	2: 'Dry Goods (General)',
	3: 'Chemicals',
	4: 'Explosives',
	5: 'Firearms/Ammunition',
	6: 'Hazardous Materials',
	7: 'Oil/Petrolium',
	8: 'Alcohol',
	10: 'Antiques/Works of Art',
	11: 'Cash,Checks,Currency',
	12: 'Consumer Electronics',
	13: 'Jewerly',
	14: 'Tobacco Products',
	15: 'Tanker Freight',
	16: 'Live Animals',
	17: 'Refrigerated (Food)',
	18: 'Refrigerated (General)',
};
const BuildLoad = () => {
	const navigate = useNavigate();
	const [customerData, setCustomerData] = useState([]);

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
		let loadInformation = {
			truckStatus: formik.values.truckStatus,
			loadStatus: formik.values.loadStatus,
			loaderBranch: formik.values.loaderBranch,
			commodity: formik.values.commodity,
			loadReference: formik.values.loadReference,
			declaredLoad: formik.values.declaredLoad,
			loadSize: formik.values.loadSize,
			goods: formik.values.goods,
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
		console.log(loadInformation);
		console.log(customerInformation);
		console.log(carrierInformation);
		let loaderInfo = {
			loadInformation: loadInformation,
			customerInformation: customerInformation,
			carrierInformation: carrierInformation,
		};
		const messageRef = collection(firestoredb, 'Loaders');
		// await messageRef.collection.add(loadInformation);
		await addDoc(collection(firestoredb, 'Loaders'), loaderInfo)
			.then(async (docRef) => {
				console.log('Document has been added successfully');
				console.log(docRef);
			})
			.catch((error) => {
				console.log(error);
			});
		// await setDoc(doc(firestoredb, 'customers'), loadInformation);
		// await messageRef.collection.add(customerInformation);
		// await messageRef.collection.add(carrierInformation);
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
				console.log(docRef.data());
				// doc.data() is never undefined for query doc snapshots
				// console.log(docRef.id, ' => ', docRef.data());
				setCustomerData((prev) => [...prev, { id: docRef.id, data: docRef.data() }]);
				// console.log(customerData);
			});
		}
	};
	useEffect(() => {
		getCustomerData();
	}, []);
	return (
		<PageWrapper title={demoPages.editPages.subMenu.editWizard.text}>
			<SubHeader>
				<SubHeaderLeft>
					<Button color='info' isLink icon='ArrowBack' onClick={() => navigate(-1)}>
						Back to List
					</Button>
					<SubheaderSeparator />
					<Avatar srcSet={User1Webp} src={User1Img} size={32} />
					<span>
						<strong>Timothy J. Doe</strong>
					</span>
					<span className='text-muted'>Edit User</span>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Button
						color='dark'
						isLight
						icon='Add'
						onClick={() => {
							setActiveTab(TABS.ACCOUNT_DETAIL);
							formik.setValues({
								firstName: '',
								lastName: '',
								displayName: '',
								emailAddress: '',
								phoneNumber: '',
								addressLine: '',
								addressLine2: '',
								city: '',
								state: '',
								zip: '',
								emailNotification: [''],
								pushNotification: [''],
							});
						}}>
						Add New
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page>
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
															{Object.keys(truckStatusesObj).map(
																(u) => (
																	// @ts-ignore
																	<Option
																		key={truckStatusesObj[u]}
																		value={truckStatusesObj[u]}>
																		{
																			// @ts-ignore
																			`${truckStatusesObj[u]}`
																		}
																	</Option>
																),
															)}
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
															{Object.keys(commodityObj).map((u) => (
																// @ts-ignore
																<Option
																	key={commodityObj[u]}
																	value={commodityObj[u]}>
																	{
																		// @ts-ignore
																		`${commodityObj[u]}`
																	}
																</Option>
															))}
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
															<Option key={2} value='Full Load'>
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
															<Option key={1} value='Full Load'>
																New
															</Option>
															<Option key={2} value='Full Load'>
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
															{Object.keys(commodityObj).map((u) => (
																// @ts-ignore
																<Option
																	key={commodityObj[u]}
																	value={commodityObj[u]}>
																	{
																		// @ts-ignore
																		`${commodityObj[u]}`
																	}
																</Option>
															))}
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
															{Object.keys(commodityObj).map((u) => (
																// @ts-ignore
																<Option
																	key={commodityObj[u]}
																	value={commodityObj[u]}>
																	{
																		// @ts-ignore
																		`${commodityObj[u]}`
																	}
																</Option>
															))}
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
															onChange={formik.handleChange}
															value={formik.values.getCarrierCustomer}
															isValid={formik.isValid}
															isTouched={
																formik.touched.getCarrierCustomer
															}
															invalidFeedback={
																formik.errors.getCarrierCustomer
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

export default BuildLoad;
