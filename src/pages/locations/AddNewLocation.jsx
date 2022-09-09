// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable prettier/prettier */
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
import CommonMyWallet from '../common/CommonMyWallet';
import editPasswordValidate from '../presentation/demo-pages/helper/editPasswordValidate';
import showNotification from '../../components/extras/showNotification';
import Icon from '../../components/icon/Icon';
import { demoPages } from '../../menu';
import Option from '../../components/bootstrap/Option';
import Textarea from '../../components/bootstrap/forms/Textarea';
import { firestoredb } from '../../firebase';
import { Award } from '../../components/icon/bootstrap';
import { addDoc, collection, doc, getDocs, query, setDoc } from 'firebase/firestore';
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

const AddNewLocation = () => {
	const navigate = useNavigate();
	const [customerData, setCustomerData] = useState([]);
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
			//location info
			locationName: '',
			locationAddress: '',
			telephone: '',
			locationType: '',
			locationCode: '',
			contactName: '',
			telephoneOptional: '',
			email: '',
			fax: '',
			privateNotes: '',
			publicNotes: '',
			//location info end
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
			let locationInformation = {
				locationName: formik.values.locationName,
				locationAddress: formik.values.locationAddress,
				locationType: formik.values.locationType,
				locationCode: formik.values.locationCode,
				telephone: formik.values.telephone,
				contactName: formik.values.contactName,
				telephoneOptional: formik.values.telephoneOptional,
				email: formik.values.email,
				fax: formik.values.fax,
				privateNotes: formik.values.privateNotes,
				publicNotes: formik.values.publicNotes,
			};
			console.log(locationInformation);

			if (!formik.values.locationName || formik.values.locationName == '') {
				showNotification(
					<span className='d-flex align-items-center'>
						<Icon icon='danger' size='lg' className='me-1' />
						<span>Please fill out form properly!</span>
					</span>,
					'Please fill out form properly!',
				);
				setisLoading(false);
			} else {
				await addDoc(collection(firestoredb, 'Locations'), locationInformation)
					.then(async (docRef) => {
						console.log('Location has been added successfully');
						console.log(docRef);
						formik.resetForm();
						showNotification(
							<span className='d-flex align-items-center'>
								<Icon icon='Info' size='lg' className='me-1' />
								<span>Success!</span>
							</span>,
							'Location Added Successfully!',
						);
						setisLoading(false);
					})
					.catch((error) => {
						showNotification(
							<span className='d-flex align-items-center'>
								<Icon icon='Info' size='lg' className='me-1' />
								<span>Error!</span>
							</span>,
							'Something went wrong!',
						);
						setisLoading(false);
						console.log(error);
					});
			}
		}
	};
	//Handlers

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
												<CardTitle>Location Address</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody className='pt-0'>
											<div className='row g-4'>
												<div className='col-md-12'>
													<FormGroup
														id='locationName'
														label='Name of Location'
														isFloating>
														<Input
															required
															placeholder='Name of Location'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.locationName}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.locationName
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-12'>
													<FormGroup
														id='locationAddress'
														label='Location Address'
														isFloating>
														<Textarea
															required
															placeholder='Location Address'
															onChange={formik.handleChange}
															value={formik.values.locationAddress}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.locationAddress
															}
														/>
													</FormGroup>
												</div>
												<div className='col-md-12'>
													<FormGroup
														id='telephone'
														label='Telephone'
														isFloating>
														<Input
															required
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
												<div className='col-md-12'>
													<FormGroup
														id='locationType'
														label='Location Type'
														isFloating>
														<Input
															required
															placeholder='Location Type'
															onChange={formik.handleChange}
															value={formik.values.locationType}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.locationType
															}
														/>
													</FormGroup>
												</div>
												<div className='col-md-12'>
													<FormGroup
														id='locationCode'
														label='Location Code'
														isFloating>
														<Input
															required
															placeholder='Location Code'
															onChange={formik.handleChange}
															value={formik.values.locationCode}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.locationCode
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
												<CardTitle>
													Location Contact List (Optional)
												</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody className='pt-0'>
											<div className='row g-4'>
												<div className='col-md-12'>
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
												</div>
												<div className='col-md-12'>
													<FormGroup
														id='telephoneOptional'
														label='Telephone'
														isFloating>
														<Input
															placeholder='Telephone'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.telephoneOptional}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.telephoneOptional
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-12'>
													<FormGroup id='email' label='Email' isFloating>
														<Input
															placeholder='Email'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.email}
															isValid={formik.isValid}
															invalidFeedback={formik.errors.email}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-12'>
													<FormGroup id='fax' label='Fax' isFloating>
														<Input
															placeholder='Fax'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.fax}
															isValid={formik.isValid}
															invalidFeedback={formik.errors.fax}
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
												<CardTitle>Notes (Optional)</CardTitle>
											</CardLabel>
										</CardHeader>
										<CardBody className='pt-0'>
											<div className='row g-4'>
												<div className='col-md-12'>
													<FormGroup
														id='privateNotes'
														label='Private Notes'
														formText='* This note is private and viewable only by your organization.'
														isFloating>
														<Textarea
															placeholder='Private Notes'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.privateNotes}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.privateNotes
															}
															validFeedback='Looks good!'
														/>
													</FormGroup>
												</div>
												<div className='col-md-12'>
													<FormGroup
														id='publicNotes'
														formText='* This note is public and will be used as location notes when added to a load.'
														label='Public Notes'
														isFloating>
														<Textarea
															placeholder='Public Notes'
															onChange={formik.handleChange}
															onBlur={formik.handleBlur}
															value={formik.values.publicNotes}
															isValid={formik.isValid}
															invalidFeedback={
																formik.errors.publicNotes
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
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default AddNewLocation;
