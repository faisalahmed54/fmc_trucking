// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable react/prop-types */
import React, { FC, useState } from 'react';
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
	Object.keys(loadStatusesObj).map((u) => {
		console.log(loadStatusesObj[u]);
	});

	const navigate = useNavigate();

	const TABS = {
		ACCOUNT_DETAIL: 'Load Details',
		PASSWORD: 'Password',
		MY_WALLET: 'My Wallet',
	};
	const [activeTab, setActiveTab] = useState(TABS.ACCOUNT_DETAIL);

	const notificationTypes = [
		{ id: 1, name: 'New Order' },
		{ id: 2, name: 'New Customer' },
		{ id: 3, name: 'Order Status' },
	];

	const formik = useFormik({
		initialValues: {
			loadStatus: '',
			truckStatus: '',
			commodity: '',
			loadReference: '',
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
														{/* <Input
															placeholder='Load Status'
															autoComplete='additional-name'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.loadStatus}
															isValid={formik.isValid}
															isTouched={formik.touched.loadStatus}
															invalidFeedback={
																formik.errors.loadStatus
															}
															validFeedback='Looks good!'
														/> */}
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
														id='lastName'
														label='Last Name'
														isFloating>
														<Input
															placeholder='Last Name'
															autoComplete='family-name'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.lastName}
															isValid={formik.isValid}
															isTouched={formik.touched.lastName}
															invalidFeedback={formik.errors.lastName}
															validFeedback='Looks good!'
														/>
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
												<CardTitle>Contact Information</CardTitle>
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
												<CardTitle>Contact Information</CardTitle>
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
								<WizardItem id='step2' title='Address'>
									<div className='row g-4'>
										<div className='col-lg-12'>
											<FormGroup
												id='addressLine'
												label='Address Line'
												isFloating>
												<Input
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.addressLine}
													isValid={formik.isValid}
													isTouched={formik.touched.addressLine}
													invalidFeedback={formik.errors.addressLine}
													validFeedback='Looks good!'
												/>
											</FormGroup>
										</div>
										<div className='col-lg-12'>
											<FormGroup
												id='addressLine2'
												label='Address Line 2'
												isFloating>
												<Input
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.addressLine2}
													isValid={formik.isValid}
													isTouched={formik.touched.addressLine2}
													invalidFeedback={formik.errors.addressLine2}
													validFeedback='Looks good!'
												/>
											</FormGroup>
										</div>

										<div className='col-lg-6'>
											<FormGroup id='city' label='City' isFloating>
												<Input
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.city}
													isValid={formik.isValid}
													isTouched={formik.touched.city}
													invalidFeedback={formik.errors.city}
													validFeedback='Looks good!'
												/>
											</FormGroup>
										</div>
										<div className='col-md-3'>
											<FormGroup id='state' label='State' isFloating>
												<Select
													ariaLabel='State'
													placeholder='Choose...'
													list={[
														{ value: 'usa', text: 'USA' },
														{ value: 'ca', text: 'Canada' },
													]}
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.state}
													isValid={formik.isValid}
													isTouched={formik.touched.state}
													invalidFeedback={formik.errors.state}
												/>
											</FormGroup>
										</div>
										<div className='col-md-3'>
											<FormGroup id='zip' label='Zip' isFloating>
												<Input
													onChange={formik.handleChange}
													onBlur={formik.handleBlur}
													value={formik.values.zip}
													isValid={formik.isValid}
													isTouched={formik.touched.zip}
													invalidFeedback={formik.errors.zip}
												/>
											</FormGroup>
										</div>
									</div>
								</WizardItem>
								<WizardItem id='step3' title='Notifications'>
									<div className='row g-4'>
										<div className='col-12'>
											<FormGroup>
												<Label>Email Notifications</Label>
												<ChecksGroup>
													{notificationTypes.map((cat) => (
														<Checks
															type='switch'
															key={cat.id}
															id={cat.id.toString()}
															name='emailNotification'
															label={cat.name}
															value={cat.id}
															onChange={formik.handleChange}
															checked={formik.values.emailNotification.includes(
																cat.id.toString(),
															)}
														/>
													))}
												</ChecksGroup>
											</FormGroup>
										</div>
										<div className='col-12'>
											<FormGroup>
												<Label>Push Notifications</Label>
												<ChecksGroup>
													{notificationTypes.map((cat) => (
														<Checks
															type='switch'
															key={cat.id}
															id={cat.id.toString()}
															name='pushNotification'
															label={cat.name}
															value={cat.id}
															onChange={formik.handleChange}
															checked={formik.values.pushNotification.includes(
																cat.id.toString(),
															)}
														/>
													))}
												</ChecksGroup>
											</FormGroup>
										</div>
									</div>
								</WizardItem>
								<WizardItem id='step4' title='Preview'>
									<div className='row g-3'>
										<div className='col-9 offset-3'>
											<h3 className='mt-4'>Account Detail</h3>
											<h4 className='mt-4'>Personal Information</h4>
										</div>
										<PreviewItem
											title='First Name'
											value={formik.values.loadStatus}
										/>
										<PreviewItem
											title='Last Name'
											value={formik.values.lastName}
										/>
										<PreviewItem
											title='Display Name'
											value={formik.values.displayName}
										/>
										<div className='col-9 offset-3'>
											<h4 className='mt-4'>Contact Information</h4>
										</div>
										<PreviewItem
											title='Phone Number'
											value={formik.values.phoneNumber}
										/>
										<PreviewItem
											title='Email Address'
											value={formik.values.emailAddress}
										/>
										<div className='col-9 offset-3'>
											<h3 className='mt-4'>Address</h3>
										</div>
										<PreviewItem
											title='Address Line'
											value={formik.values.addressLine}
										/>
										<PreviewItem
											title='Address Line 2'
											value={formik.values.addressLine2}
										/>
										<PreviewItem title='City' value={formik.values.city} />
										<PreviewItem title='State' value={formik.values.state} />
										<PreviewItem title='ZIP' value={formik.values.zip} />
										<div className='col-9 offset-3'>
											<h4 className='mt-4'>Notification</h4>
										</div>
										<PreviewItem
											title='Email Notifications'
											value={notificationTypes.map(
												(cat) =>
													formik.values.emailNotification.includes(
														cat.id.toString(),
													) && `${cat.name}, `,
											)}
										/>
										<PreviewItem
											title='Push Notifications'
											value={notificationTypes.map(
												(cat) =>
													formik.values.pushNotification.includes(
														cat.id.toString(),
													) && `${cat.name}, `,
											)}
										/>
									</div>
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
