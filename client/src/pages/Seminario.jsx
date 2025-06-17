import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import SeminarioLists from '../components/SeminarioLists'
import Navbar from '../components/Navbar'
import { AuthContext } from '../context/AuthContext'

const Seminario = () => {
	const { auth } = useContext(AuthContext)
	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors }
	} = useForm()

	const [seminari, setSeminari] = useState([])
	const [isFetchingSeminariDone, setIsFetchingSeminariDone] = useState(false)
	const [isAddingSeminario, SetIsAddingSeminario] = useState(false)

	const fetchSeminari = async (data) => {
		try {
			setIsFetchingSeminariDone(false)
			const response = await axios.get('/seminario')
			// console.log(response.data.data)
			reset()
			setSeminari(response.data.data)
		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingSeminariDone(true)
		}
	}

	useEffect(() => {
		fetchSeminari()
	}, [])

	const onAddSeminario = async (data) => {
		try {
			data.length = (parseInt(data.lengthHr) || 0) * 60 + (parseInt(data.lengthMin) || 0)
			SetIsAddingSeminario(true)
			const response = await axios.post('/seminario', data, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// console.log(response.data)
			fetchSeminari()
			toast.success('Add seminario successful!', {
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
			SetIsAddingSeminario(false)
		}
	}

	const handleDelete = (seminario) => {
		const confirmed = window.confirm(
			`Do you want to delete seminario ${seminario.name}, including its showtimes and tickets?`
		)
		if (confirmed) {
			onDeleteSeminario(seminario._id)
		}
	}

	const onDeleteSeminario = async (id) => {
		try {
			const response = await axios.delete(`/seminario/${id}`, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// console.log(response.data)
			fetchSeminari()
			toast.success('Delete seminario successful!', {
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

	const inputHr = parseInt(watch('lengthHr')) || 0
	const inputMin = parseInt(watch('lengthMin')) || 0
	const sumMin = inputHr * 60 + inputMin
	const hr = Math.floor(sumMin / 60)
	const min = sumMin % 60

	return (
		<div className="flex min-h-screen flex-col gap-4 bg-gradient-to-br from-indigo-900 to-blue-500 pb-8 text-gray-900 sm:gap-8">
			<Navbar />
			<div className="mx-4 flex h-fit flex-col gap-4 rounded-md bg-gradient-to-br from-indigo-200 to-blue-100 p-4 drop-shadow-xl sm:mx-8 sm:p-6">
				<h2 className="text-3xl font-bold text-gray-900">Seminario Lists</h2>
				<form
					onSubmit={handleSubmit(onAddSeminario)}
					className="flex flex-col items-stretch justify-end gap-x-4 gap-y-2 rounded-md bg-gradient-to-br from-indigo-100 to-white p-4 drop-shadow-md lg:flex-row"
				>
					<div className="flex w-full grow flex-col flex-wrap justify-start gap-4 lg:w-auto">
						<h3 className="text-xl font-bold">Add Seminario</h3>
						<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
							<label className="text-lg font-semibold leading-5">Name :</label>
							<input
								type="text"
								required
								className="w-full flex-grow rounded px-3 py-1 font-semibold drop-shadow-sm sm:w-auto"
								{...register('name', {
									required: true
								})}
							/>
						</div>
						<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
							<label className="text-lg font-semibold leading-5">Poster URL :</label>
							<input
								type="text"
								required
								className="w-full flex-grow rounded px-3 py-1 font-semibold drop-shadow-sm sm:w-auto"
								{...register('img', {
									required: true
								})}
							/>
						</div>
						<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
							<label className="text-lg font-semibold leading-5">Length (hr.):</label>
							<input
								type="number"
								min="0"
								max="20"
								maxLength="2"
								className="w-full flex-grow rounded px-3 py-1 font-semibold drop-shadow-sm sm:w-auto"
								{...register('lengthHr')}
							/>
						</div>
						<div>
							<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
								<label className="text-lg font-semibold leading-5">Lunghezza (min.):</label>
								<input
									type="number"
									min="0"
									max="2000"
									maxLength="4"
									required
									className="w-full flex-grow rounded px-3 py-1 font-semibold drop-shadow-sm sm:w-auto"
									{...register('lengthMin', {
										required: true
									})}
								/>
							</div>
							<div className="pt-1 text-right">{`${hr}h ${min}m / ${sumMin}m `}</div>
						</div>
					</div>
					<div className="flex w-full flex-col gap-4 lg:w-auto lg:flex-row">
						{watch('img') && (
							<img src={watch('img')} className="h-48 rounded-md object-contain drop-shadow-md lg:h-64" />
						)}
						<button
							className="w-full min-w-fit items-center rounded-md bg-gradient-to-br from-indigo-600 to-blue-500 px-2 py-1 text-center font-medium text-white drop-shadow-md hover:from-indigo-500 hover:to-blue-500 disabled:from-slate-500 disabled:to-slate-400 lg:w-24 xl:w-32 xl:text-xl"
							type="submit"
							disabled={isAddingSeminario}
						>
							{isAddingSeminario ? 'Processing...' : 'ADD +'}
						</button>
					</div>
				</form>
				<div className="relative drop-shadow-sm">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<MagnifyingGlassIcon className="h-5 w-5 stroke-2 text-gray-500" />
					</div>
					<input
						type="search"
						className="block w-full rounded-lg border border-gray-300 p-2 pl-10 text-gray-900"
						placeholder="Search seminario"
						{...register('search')}
					/>
				</div>
				{isFetchingSeminariDone ? (
					<SeminarioLists seminari={seminari} search={watch('search')} handleDelete={handleDelete} />
				) : (
					<Loading />
				)}
			</div>
		</div>
	)
}

export default Seminario
