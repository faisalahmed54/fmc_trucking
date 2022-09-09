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
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc } from 'firebase/firestore';
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
		carrierAddress: '',
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
	if (!values.carrierAddress) {
		console.log('yes');

		errors.carrierAddress = 'Required';
	} else if (values.carrierAddress.length < 3) {
		errors.carrierAddress = 'Must be 3 characters or more';
	} else if (values.carrierAddress.length > 20) {
		errors.carrierAddress = 'Must be 20 characters or less';
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

const EditCarrier = () => {
	const location = useLocation();

	const navigate = useNavigate();
	const [customerData, setCustomerData] = useState([]);
	const [count, setCount] = useState();
	const [carrierData, setCarrierData] = useState(null);
	const [isLoading, setisLoading] = useState(false);

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
			//carrier info
			carrierAddress: '',
			carrierName: '',
			doNotLoad: '',
			checksPayableTo: '',
			telephone: '',
			mcffmxNumber: '',
			taxIdNumber: '',
			usdotNumber: '',
			vendor1099: '',
			paymentTerms: '',
			paymentMethod: '',
			primaryInsuranceDetails: '',
			cargoInsuranceDetails: '',
			primaryInsuranceExpiration: '',
			cargoInsuranceExpiration: '',
			contactName: '',
			telephoneOptional: '',
			email: '',
			fax: '',
			privateLoadNote: '',
			weightUnit: '',
			distanceUnit: '',
			temperatureUnit: '',
			//carrier info end
		},

		validate: validate,
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
			let carrierInformation = {
				carrierAddress: formik.values.carrierAddress,
				carrierName: formik.values.carrierName,
				doNotLoad: formik.values.doNotLoad,
				checksPayableTo: formik.values.checksPayableTo,
				telephone: formik.values.telephone,
				mcffmxNumber: formik.values.mcffmxNumber,
				taxIdNumber: formik.values.taxIdNumber,
				usdotNumber: formik.values.usdotNumber,
				vendor1099: formik.values.vendor1099,
				paymentTerms: formik.values.paymentTerms,
				paymentMethod: formik.values.paymentMethod,
				primaryInsuranceDetails: formik.values.primaryInsuranceDetails,
				cargoInsuranceDetails: formik.values.cargoInsuranceDetails,
				primaryInsuranceExpiration: formik.values.primaryInsuranceExpiration,
				cargoInsuranceExpiration: formik.values.cargoInsuranceExpiration,
				contactName: formik.values.contactName,
				telephoneOptional: formik.values.telephoneOptional,
				email: formik.values.email,
				fax: formik.values.fax,
				privateLoadNote: formik.values.privateLoadNote,
				weightUnit: formik.values.weightUnit,
				distanceUnit: formik.values.distanceUnit,
				temperatureUnit: formik.values.temperatureUnit,
			};

			console.log(carrierInformation);

			// const messageRef = collection(firestoredb, 'Carriers');
			// await messageRef.collection.add(loadInformation);
			if (!formik.values.carrierAddress || formik.values.carrierAddress == '') {
				showNotification(
					<span className='d-flex align-items-center'>
						<Icon icon='danger' size='lg' className='me-1' />
						<span>Please fill out form properly!</span>
					</span>,
					'Please fill out form properly!',
				);
				setisLoading(false);
			} else {
				// Edit and save document in collection "Carriers"
				await setDoc(doc(firestoredb, 'Carriers', result[4]), carrierInformation)
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
		}
	};
	//Handlers
	const getCarrierData = async () => {
		const result = location.pathname.split(/[.\-&=/_]/);
		// console.log(result[4]);
		const docRef = doc(firestoredb, 'Carriers', result[4]);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			console.log('Document data:', docSnap.data());
			setCarrierData({ id: docSnap.id, data: docSnap.data() });
		} else {
			// doc.data() will be undefined in this case
			console.log('No such document!');
		}
	};
	useEffect(() => {
		setisLoading(true);

		getCarrierData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		if (carrierData) {
			setCount(1);
			console.log(carrierData);
			//Carrier Information
			formik.values.cargoInsuranceDetails = carrierData.data.cargoInsuranceDetails;
			formik.values.cargoInsuranceExpiration = carrierData.data.cargoInsuranceExpiration;
			formik.values.carrierAddress = carrierData.data.carrierAddress;
			formik.values.carrierName = carrierData.data.carrierName;
			formik.values.checksPayableTo = carrierData.data.checksPayableTo;
			formik.values.contactName = carrierData.data.contactName;
			formik.values.distanceUnit = carrierData.data.distanceUnit;
			formik.values.doNotLoad = carrierData.data.doNotLoad;
			formik.values.email = carrierData.data.email;
			formik.values.mcffmxNumber = carrierData.data.mcffmxNumber;
			formik.values.fax = carrierData.data.fax;
			formik.values.paymentMethod = carrierData.data.paymentMethod;
			formik.values.paymentTerms = carrierData.data.paymentTerms;
			formik.values.primaryInsuranceDetails = carrierData.data.primaryInsuranceDetails;
			formik.values.primaryInsuranceExpiration = carrierData.data.primaryInsuranceExpiration;
			formik.values.privateLoadNote = carrierData.data.privateLoadNote;
			formik.values.taxIdNumber = carrierData.data.taxIdNumber;
			formik.values.telephone = carrierData.data.telephone;
			formik.values.telephoneOptional = carrierData.data.telephoneOptional;
			formik.values.temperatureUnit = carrierData.data.temperatureUnit;
			formik.values.usdotNumber = carrierData.data.usdotNumber;
			formik.values.vendor1099 = carrierData.data.vendor1099;
			formik.values.weightUnit = carrierData.data.weightUnit;

			setisLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [carrierData]);
	return (
		<PageWrapper title={demoPages.editPages.subMenu.editWizard.text}>
			<SubHeader>
				<SubHeaderLeft>
					<Button
						color='info'
						isLink
						icon='ArrowBack'
						onClick={() => navigate('/carriers/view-carrier')}>
						Back to List
					</Button>
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
					<div className='col-lg-12 col-md-12'>
						{TABS.ACCOUNT_DETAIL === activeTab && (
							<Wizard
								isHeader
								stretch
								color='info'
								onSubmit={(e) => {
									e.preventDefault();
									// formik.handleSubmit();
									saveLoadToDatabase();
								}}
								className='shadow-3d-info'>
								<WizardItem id='step1' title='Please Tell Us About This Carrier'>
									<Card>
										<CardHeader>
											<CardLabel icon='Edit' iconColor='warning'>
												<CardTitle>Basic Information</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody className='pt-0'>
											<div className='row g-4'>
												<div className='col-md-12'>
													<FormGroup
														id='carrierAddress'
														label='Carrier Address'
														isFloating
														formText='Start typing a name or address in the box above and we will search the internet for a match. Simply select the best match and we will fill out the rest of the form below.
														
Premium users can type the MC, DOT, FF, or MX number. We will then auto-populate this screen for you, show carrier verification data, and display fraud alerts'>
														<Input
															required
															placeholder='Carrier Address'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.carrierAddress}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.carrierAddress
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='carrierName'
														label='Carrier Name'
														isFloating>
														<Input
															required
															placeholder='Carrier Name'
															onChange={formik.handleChange}
															value={formik.values.carrierName}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.carrierName
															}
														/>
													</FormGroup>
													<FormGroup
														id='doNotLoad'
														label='Do not Load'
														isFloating>
														<Select
															defaultValue={'DO NOT LOAD'}
															onChange={formik.handleChange}
															value={formik.values.doNotLoad}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.doNotLoad
															}>
															<Option key={1} value='OK TO LOAD'>
																OK TO LOAD
															</Option>
															<Option key={2} value='DO NOT LOAD'>
																DO NOT LOAD
															</Option>
														</Select>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='checksPayableTo'
														label='Checks payable to'
														isFloating>
														<Input
															required
															placeholder='Checks payable to'
															onChange={formik.handleChange}
															value={formik.values.checksPayableTo}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.checksPayableTo
															}
														/>
													</FormGroup>
													<FormGroup
														id='telephone'
														label='Telephone'
														isFloating>
														<Input
															placeholder='Telephone'
															onChange={formik.handleChange}
															value={formik.values.telephone}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.telephone
															}
														/>
													</FormGroup>
												</div>
											</div>
										</CardBody>
									</Card>

									<Card className='mb-0'>
										<CardHeader>
											<CardLabel icon='MarkunreadMailbox' iconColor='success'>
												<CardTitle>Carrier Details</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody className='pt-0'>
											<div className='row g-4'>
												<div className='col-md-6'>
													<FormGroup
														id='mcffmxNumber'
														label='MC/FF/MX Number'
														isFloating>
														<Input
															placeholder='MC/FF/MX Number'
															onChange={formik.handleChange}
															value={formik.values.mcffmxNumber}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.mcffmxNumber
															}
														/>
													</FormGroup>
													<FormGroup
														id='taxIdNumber'
														label='Tax ID Number'
														isFloating>
														<Input
															placeholder='Tax ID Number'
															onChange={formik.handleChange}
															value={formik.values.taxIdNumber}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.taxIdNumber
															}
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='usdotNumber'
														label='USDOT Number'
														isFloating>
														<Input
															placeholder='USDOT Number'
															onChange={formik.handleChange}
															value={formik.values.usdotNumber}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.usdotNumber
															}
														/>
													</FormGroup>
													<FormGroup
														id='vendor1099'
														label='1099 Vendor?'
														isFloating>
														<Select
															defaultValue={'NO'}
															onChange={formik.handleChange}
															value={formik.values.vendor1099}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.vendor1099
															}>
															<Option key={1} value='YES'>
																YES
															</Option>
															<Option key={2} value='NO'>
																NO
															</Option>
														</Select>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														formText='Enter your default payment terms for this carrier'
														id='paymentTerms'
														label='Payment Terms in days'
														isFloating>
														<Input
															placeholder='Payment Terms in days'
															onChange={formik.handleChange}
															value={formik.values.paymentTerms}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.paymentTerms
															}
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='paymentMethod'
														label='Payment Method'
														formText='Select your default payment method for this carrier or add your own'
														isFloating>
														<Select
															defaultValue='Standard Pay'
															onChange={formik.handleChange}
															value={formik.values.paymentMethod}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.paymentMethod
															}>
															<Option value='Standard Pay'>
																Standard Pay
															</Option>
															<Option value='Quick Pay'>
																Quick Pay
															</Option>
															<Option value='Pay When Paid'>
																Pay When Paid
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
												<CardTitle> Carrier Insurance</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody className='pt-0'>
											<div className='row g-4'>
												<div className='col-md-6'>
													<FormGroup
														id='primaryInsuranceDetails'
														label='Primary Insurance (BIPD) Details'
														isFloating>
														<Textarea
															placeholder='Primary Insurance (BIPD) Details'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={
																formik.values
																	.primaryInsuranceDetails
															}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors
																	.primaryInsuranceDetails
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
													<FormGroup
														id='cargoInsuranceDetails'
														label='Cargo Insurance Details'
														isFloating>
														<Textarea
															placeholder='Cargo Insurance Details'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={
																formik.values.cargoInsuranceDetails
															}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.cargoInsuranceDetails
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-6'>
													<FormGroup
														id='primaryInsuranceExpiration'
														label='Primary Insurance Expiration'
														isFloating>
														<Input
															type='date'
															placeholder='Primary Insurance Expiration'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={
																formik.values
																	.primaryInsuranceExpiration
															}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors
																	.primaryInsuranceExpiration
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
													<FormGroup
														id='cargoInsuranceExpiration'
														label='Cargo Insurance Expiration'
														isFloating>
														<Input
															type='date'
															placeholder='Cargo Insurance Expiration'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={
																formik.values
																	.cargoInsuranceExpiration
															}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors
																	.cargoInsuranceExpiration
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
												<CardTitle>
													Carrier Contact List (Optional)
												</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody className='pt-0'>
											<div className='row g-4'>
												<div className='col-12'>
													<FormGroup
														id='contactName'
														label='Contact Name'
														isFloating>
														<Input
															placeholder='Contact Name'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.contactName}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.contactName
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>{' '}
												<div className='col-12'>
													<FormGroup
														id='telephoneOptional'
														label='Telephone'
														isFloating>
														<Input
															placeholder='Telephone'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.telephoneOptional}
														/>
													</FormGroup>
												</div>
												<div className='col-12'>
													<FormGroup
														id='email'
														label='Email Address'
														isFloating>
														<Input
															placeholder='Email Address'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.email}
														/>
													</FormGroup>
												</div>
												<div className='col-12'>
													<FormGroup id='fax' label='Fax' isFloating>
														<Input
															placeholder='Fax'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.fax}
														/>
													</FormGroup>
												</div>
											</div>
										</CardBody>
									</Card>
									<Card className='mb-0'>
										<CardHeader>
											<CardLabel icon='MarkunreadMailbox' iconColor='success'>
												<CardTitle>Notes (Optional)</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody className='pt-0'>
											<div className='row g-4'>
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
														/>
													</FormGroup>
												</div>
											</div>
										</CardBody>
									</Card>
									<Card className='mb-0'>
										<CardHeader>
											<CardLabel icon='MarkunreadMailbox' iconColor='success'>
												<CardTitle>
													{' '}
													Customize Units of Measurement (Optional)
												</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody className='pt-0'>
											<div className='row g-4'>
												<div className='col-12'>
													<FormGroup
														id='weightUnit'
														label='Weight Unit'
														isFloating>
														<Select
															defaultValue={`Use my company's default setting`}
															onChange={formik.handleChange}
															value={formik.values.weightUnit}>
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
												</div>
											</div>
											<div className='col-12'>
												<FormGroup
													id='distanceUnit'
													label='Distance Unit'
													isFloating>
													<Select
														defaultValue={`Use my company's default setting`}
														onChange={formik.handleChange}
														value={formik.values.distanceUnit}>
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
											<div className='col-12'>
												<FormGroup
													id='temperatureUnit'
													label='Temperature Unit'
													isFloating>
													<Select
														defaultValue={`Use my company's default setting`}
														onChange={formik.handleChange}
														value={formik.values.temperatureUnit}>
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
										</CardBody>
									</Card>
								</WizardItem>
							</Wizard>
						)}
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default EditCarrier;
