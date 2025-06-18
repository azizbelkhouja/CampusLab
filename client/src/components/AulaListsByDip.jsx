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
import Aula from './Aula'

const AulaListsByDip = ({ dips, selectedDipIndex, setSelectedDipIndex, fetchDips, auth }) => {
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
		setValueName('name', dips[selectedDipIndex].name)
	}, [dips[selectedDipIndex].name])

	const handleDelete = (dip) => {
		const confirmed = window.confirm(
			`Do you want to delete dipartimento ${dip.name}, including its aule, showtimes and tickets?`
		)
		if (confirmed) {
			onDeleteDip(dip._id)
		}
	}

	const onDeleteDip = async (id) => {
		try {
			SetIsDeleting(true)
			const response = await axios.delete(`/dip/${id}`, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})

			setSelectedDipIndex(null)
			fetchDips()
			toast.success('Eliminazione dipartimento riuscita!', {
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

	const onIncreaseAula = async (data) => {
		try {
			SetIsIncreaseing(true)
			const response = await axios.post(
				`/aula`,
				{
					dip: dips[selectedDipIndex]._id,
					number: dips[selectedDipIndex].aulas.length + 1,
					row: data.row.toUpperCase(),
					column: data.column
				},
				{
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				}
			)
			fetchDips()

			toast.success('Aula aggiunta con successo!', {
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

	const handleDecreaseAula = (dip) => {
		const confirmed = window.confirm(
			`Vuoi eliminare l'aula ${dips[selectedDipIndex].aulas.length}, inclusi i suoi orari e passi?`
		)
		if (confirmed) {
			onDecreaseAula()
		}
	}

	const onDecreaseAula = async () => {
		try {
			SetIsDecreasing(true)
			const response = await axios.delete(`/aula/${dips[selectedDipIndex].aulas.slice(-1)[0]._id}`, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// console.log(response.data)
			fetchDips()
			toast.success('Decrease aula successful!', {
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

	const onEditDip = async (data) => {
		try {
			const response = await axios.put(
				`/dip/${dips[selectedDipIndex]._id}`,
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
			fetchDips(data.name)
			toast.success('Modifica nome dipartimento riuscita!', {
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
		<div className="mx-4 h-fit text-gray-900 border-[1px] border-black sm:mx-8">
			<div className="flex items-center justify-center gap-2 bg-black px-2 py-1.5 text-center text-2xl font-semibold text-white sm:py-2">
				{isEditing ? (
					<input
						title="Nome Dipartimento"
						type="text"
						required
						autoFocus
						className={`flex-grow border border-white px-1 text-center text-2xl font-semibold drop-shadow-sm sm:text-3xl ${
							errorsName.name && 'border-2 border-red-500'
						}`}
						{...registerName('name', { required: true })}
					/>
				) : (
					<span className="flex-grow text-2xl sm:text-3xl">{dips[selectedDipIndex]?.name}</span>
				)}
				{auth.role === 'admin' && (
					<>
						{isEditing ? (
							<form onClick={handleSubmitName(onEditDip)}>
								<button
									title="Salva dipartimento"
									className="flex w-fit items-center gap-1 py-1 pl-2 pr-1.5 text-sm font-medium text-white"
									onClick={() => {
										SetIsEditing(false)
									}}
								>
									SALVA
									<CheckIcon className="h-5 w-5" />
								</button>
							</form>
						) : (
							<button
								title="Edit Dipartimento name"
								className="flex w-fit items-center gap-1 py-1 pl-2 pr-1.5 text-sm font-medium text-white"
								onClick={() => SetIsEditing(true)}
							>
								Modifica
								<PencilSquareIcon className="h-5 w-5" />
							</button>
						)}
						<button
							title="Delete dipartimento"
							disabled={isDeleting}
							className="flex w-fit items-center gap-1 bg-red-500 py-1 pl-2 pr-1.5 text-sm font-medium text-white"
							onClick={() => handleDelete(dips[selectedDipIndex])}
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

				<form className="flex flex-col gap-4" onSubmit={handleSubmit(onIncreaseAula)}>
					<h2 className="text-3xl font-bold">Aule</h2>
					{auth.role === 'admin' && (
						<div className="flex w-full flex-wrap justify-between gap-4 border-[1px] border-black bg-white p-4 text-gray-900">
							<h3 className="flex items-center text-xl font-bold">Aggiungi Aula</h3>
							<div className="flex grow flex-col gap-4 sm:justify-end md:flex-row">
								<div className="flex flex-wrap justify-end gap-4">
									<div className="flex flex-wrap gap-2">
										<ArrowsUpDownIcon className="h-6 w-6" />
										<div className="my-1 flex flex-col items-end">
											<label className="text-lg font-semibold leading-5">Ultima riga :</label>
											<label className="text-xs font-semibold">(A-Z)</label>
										</div>
										<input
											title={errors.row ? errors.row.message : 'A to Z'}
											type="text"
											maxLength="2"
											required
											className={`w-14 border-[1px] border-[#A2841F] px-3 py-1 text-2xl leading-3
											${errors.row && 'border-2 border-red-500'}`}
											{...register('row', {
												required: true,
												pattern: {
													value: /^([A-Da-d][A-Za-z]|[A-Za-z])$/,
													message: 'Riga non valida, deve essere da A a Z'
												}
											})}
										/>
									</div>
									<div className="flex flex-wrap gap-2">
										<ArrowsRightLeftIcon className="h-6 w-6" />
										<div className="my-1 flex flex-col items-end">
											<label className="text-lg font-semibold leading-5">Ultima Colonna :</label>
											<label className="text-xs font-semibold">(1-120)</label>
										</div>
										<input
											title={errors.column ? errors.column.message : '1 to 120'}
											type="number"
											min="1"
											max="120"
											maxLength="3"
											required
											className={`w-24 border-[1px] border-[#A2841F] px-3 py-1 text-2xl leading-3 ${
												errors.column && 'border-2 border-red-500'
											}`}
											{...register('column', { required: true })}
										/>
									</div>
								</div>
								<div className="flex grow md:grow-0">
									<div className="flex flex-col items-center justify-center gap-1 text-black p-1 border-[1px] border-black">
										<label className="text-xs font-semibold leading-3">Numero</label>
										<label className="text-2xl font-semibold leading-5">
											{dips[selectedDipIndex].aulas.length + 1}
										</label>
									</div>
									<button
										title="Aggiungi aula"
										disabled={isIncreasing}
										className="flex grow items-center justify-center whitespace-nowrap bg-black px-2 py-1 font-medium text-white drop-shadow-md hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400 md:grow-0"
										type="submit"
									>
										{isIncreasing ? 'Elaborazione...' : 'AGGIUNGI +'}
									</button>
								</div>
							</div>
						</div>
					)}
				</form>
				{dips[selectedDipIndex].aulas.map((aula, index) => {
					return (
						<Aula
							key={index}
							aulaId={aula._id}
							seminari={seminari}
							selectedDate={selectedDate}
							setSelectedDate={setSelectedDate}
						/>
					)
				})}
				{auth.role === 'admin' && dips[selectedDipIndex].aulas.length > 0 && (
					<div className="flex justify-center">
						<button
							title="Elimina Ultima Aula"
							className="w-fit bg-red-500 px-2 py-1 font-medium text-white drop-shadow-md hover:bg-red-600 disabled:from-slate-500 disabled:to-slate-400"
							onClick={() => handleDecreaseAula()}
							disabled={isDecreasing}
						>
							{isDecreasing ? 'Elaborazione...' : 'Elimina Ultima Aula'}
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

export default AulaListsByDip
