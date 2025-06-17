import {
	ArrowsRightLeftIcon,
	ArrowsUpDownIcon,
	CheckIcon,
	PencilSquareIcon,
	TrashIcon
} from '@heroicons/react/24/solid'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DateSelector from './DateSelector'
import Theater from './Theater'

const TheaterListsByLab = ({ labs, selectedLabIndex, setSelectedLabIndex, fetchLabs, auth }) => {
	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm()

	const {
		register: registerName,
		handleSubmit: handleSubmitName,
		setValue: setValueName,
		formState: { errors: errorsName }
	} = useForm()

	const [seminari, setSeminari] = useState()
	const [selectedDate, setSelectedDate] = useState(
		(sessionStorage.getItem('selectedDate') && new Date(sessionStorage.getItem('selectedDate'))) || new Date()
	)
	const [isIncreasing, SetIsIncreaseing] = useState(false)
	const [isDeleting, SetIsDeleting] = useState(false)
	const [isDecreasing, SetIsDecreasing] = useState(false)
	const [isEditing, SetIsEditing] = useState(false)

	const fetchSeminari = async (data) => {
		try {
			const response = await axios.get('/seminario')
			// console.log(response.data.data)
			setSeminari(response.data.data)
		} catch (error) {
			console.error(error)
		}
	}

	useEffect(() => {
		fetchSeminari()
	}, [])

	useEffect(() => {
		SetIsEditing(false)
		setValueName('name', labs[selectedLabIndex].name)
	}, [labs[selectedLabIndex].name])

	const handleDelete = (lab) => {
		const confirmed = window.confirm(
			`Do you want to delete lab ${lab.name}, including its theaters, showtimes and tickets?`
		)
		if (confirmed) {
			onDeleteLab(lab._id)
		}
	}

	const onDeleteLab = async (id) => {
		try {
			SetIsDeleting(true)
			const response = await axios.delete(`/lab/${id}`, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})

			setSelectedLabIndex(null)
			fetchLabs()
			toast.success('Delete lab successful!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error('Error', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			SetIsDeleting(false)
		}
	}

	const onIncreaseTheater = async (data) => {
		try {
			SetIsIncreaseing(true)
			const response = await axios.post(
				`/theater`,
				{
					lab: labs[selectedLabIndex]._id,
					number: labs[selectedLabIndex].theaters.length + 1,
					row: data.row.toUpperCase(),
					column: data.column
				},
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)
			fetchLabs()

			toast.success('Add theater successful!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error(errors, {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			SetIsIncreaseing(false)
		}
	}

	const handleDecreaseTheater = (lab) => {
		const confirmed = window.confirm(
			`Do you want to delete theater ${labs[selectedLabIndex].theaters.length}, including its showtimes and tickets?`
		)
		if (confirmed) {
			onDecreaseTheater()
		}
	}

	const onDecreaseTheater = async () => {
		try {
			SetIsDecreasing(true)
			const response = await axios.delete(`/theater/${labs[selectedLabIndex].theaters.slice(-1)[0]._id}`, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// console.log(response.data)
			fetchLabs()
			toast.success('Decrease theater successful!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error('Error', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			SetIsDecreasing(false)
		}
	}

	const onEditLab = async (data) => {
		try {
			const response = await axios.put(
				`/lab/${labs[selectedLabIndex]._id}`,
				{
					name: data.name
				},
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)
			// console.log(response.data)
			fetchLabs(data.name)
			toast.success('Edit lab name successful!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error('Error', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		}
	}

	return (
		<div className="mx-4 h-fit rounded-md bg-gradient-to-br from-indigo-200 to-blue-100 text-gray-900 drop-shadow-md sm:mx-8">
			<div className="flex items-center justify-center gap-2 rounded-t-md bg-gradient-to-br from-gray-900 to-gray-800 px-2 py-1.5 text-center text-2xl font-semibold text-white sm:py-2">
				{isEditing ? (
					<input
						title="Lab name"
						type="text"
						required
						autoFocus
						className={`flex-grow rounded border border-white bg-gradient-to-br from-gray-900 to-gray-800 px-1 text-center text-2xl font-semibold drop-shadow-sm sm:text-3xl ${
							errorsName.name && 'border-2 border-red-500'
						}`}
						{...registerName('name', { required: true })}
					/>
				) : (
					<span className="flex-grow text-2xl sm:text-3xl">{labs[selectedLabIndex]?.name}</span>
				)}
				{auth.role === 'admin' && (
					<>
						{isEditing ? (
							<form onClick={handleSubmitName(onEditLab)}>
								<button
									title="Save lab name"
									className="flex w-fit items-center gap-1 rounded-md bg-gradient-to-r from-indigo-600 to-blue-500  py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-blue-400"
									onClick={() => {
										SetIsEditing(false)
									}}
								>
									SAVE
									<CheckIcon className="h-5 w-5" />
								</button>
							</form>
						) : (
							<button
								title="Edit Lab name"
								className="flex w-fit items-center gap-1 rounded-md bg-gradient-to-r from-indigo-600 to-blue-500  py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-indigo-500 hover:to-blue-400"
								onClick={() => SetIsEditing(true)}
							>
								Modifica
								<PencilSquareIcon className="h-5 w-5" />
							</button>
						)}
						<button
							title="Delete lab"
							disabled={isDeleting}
							className="flex w-fit items-center gap-1 rounded-md bg-gradient-to-r from-red-700 to-rose-600 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:from-red-600 hover:to-rose-600 disabled:from-slate-500 disabled:to-slate-400"
							onClick={() => handleDelete(labs[selectedLabIndex])}
						>
							{isDeleting ? (
								'Processing...'
							) : (
								<>
									Elimina
									<TrashIcon className="h-5 w-5" />
								</>
							)}
						</button>
					</>
				)}
			</div>
			<div className="flex flex-col gap-6 p-4 sm:p-6 overflow-y-auto">
				<DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
				<form className="flex flex-col gap-4" onSubmit={handleSubmit(onIncreaseTheater)}>
					<h2 className="text-3xl font-bold">Theaters</h2>
					{auth.role === 'admin' && (
						<div className="flex w-full flex-wrap justify-between gap-4 rounded-md bg-gradient-to-br from-indigo-100 to-white p-4">
							<h3 className="flex items-center text-xl font-bold">Add Theater</h3>
							<div className="flex grow flex-col gap-4 sm:justify-end md:flex-row">
								<div className="flex flex-wrap justify-end gap-4">
									<div className="flex flex-wrap gap-2">
										<ArrowsUpDownIcon className="h-6 w-6" />
										<div className="my-1 flex flex-col items-end">
											<label className="text-lg font-semibold leading-5">Last Row :</label>
											<label className="text-xs font-semibold">(A-DZ)</label>
										</div>
										<input
											title={errors.row ? errors.row.message : 'A to DZ'}
											type="text"
											maxLength="2"
											required
											className={`w-14 rounded px-3 py-1 text-2xl font-semibold drop-shadow-sm leading-3
											${errors.row && 'border-2 border-red-500'}`}
											{...register('row', {
												required: true,
												pattern: {
													value: /^([A-Da-d][A-Za-z]|[A-Za-z])$/,
													message: 'Invalid row'
												}
											})}
										/>
									</div>
									<div className="flex flex-wrap gap-2">
										<ArrowsRightLeftIcon className="h-6 w-6" />
										<div className="my-1 flex flex-col items-end">
											<label className="text-lg font-semibold leading-5">Last Column :</label>
											<label className="text-xs font-semibold">(1-120)</label>
										</div>
										<input
											title={errors.column ? errors.column.message : '1 to 120'}
											type="number"
											min="1"
											max="120"
											maxLength="3"
											required
											className={`w-24 rounded px-3 py-1 text-2xl font-semibold drop-shadow-sm leading-3 ${
												errors.column && 'border-2 border-red-500'
											}`}
											{...register('column', { required: true })}
										/>
									</div>
								</div>
								<div className="flex grow md:grow-0">
									<div className="flex flex-col items-center justify-center gap-1 rounded-l bg-gradient-to-br from-gray-800 to-gray-700 p-1 text-white">
										<label className="text-xs font-semibold leading-3">Number</label>
										<label className="text-2xl font-semibold leading-5">
											{labs[selectedLabIndex].theaters.length + 1}
										</label>
									</div>
									<button
										title="Add theater"
										disabled={isIncreasing}
										className="flex grow items-center justify-center whitespace-nowrap rounded-r bg-gradient-to-r from-indigo-600 to-blue-500 px-2 py-1 font-medium text-white drop-shadow-md hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400 md:grow-0"
										type="submit"
									>
										{isIncreasing ? 'Elaborazione...' : 'AGGIUNGI +'}
									</button>
								</div>
							</div>
						</div>
					)}
				</form>
				{labs[selectedLabIndex].theaters.map((theater, index) => {
					return (
						<Theater
							key={index}
							theaterId={theater._id}
							seminari={seminari}
							selectedDate={selectedDate}
							setSelectedDate={setSelectedDate}
						/>
					)
				})}
				{auth.role === 'admin' && labs[selectedLabIndex].theaters.length > 0 && (
					<div className="flex justify-center">
						<button
							title="Delete last theater"
							className="w-fit rounded-md bg-gradient-to-r from-red-700 to-rose-600 px-2 py-1 font-medium text-white drop-shadow-md hover:from-red-600 hover:to-rose-500 disabled:from-slate-500 disabled:to-slate-400"
							onClick={() => handleDecreaseTheater()}
							disabled={isDecreasing}
						>
							{isDecreasing ? 'Elaborazione...' : 'DELETE LAST THEATER -'}
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

export default TheaterListsByLab
