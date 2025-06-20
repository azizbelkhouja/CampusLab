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
		<div className="flex min-h-screen flex-col gap-4 text-gray-900 sm:gap-8">
			<Navbar />
			<div className="mx-4 flex h-fit flex-col gap-4 p-4 sm:mx-8 sm:p-6">
				<form
					onSubmit={handleSubmit(onAddSeminario)}
					className="flex flex-col items-stretch justify-end gap-x-4 gap-y-2 border-[2px] p-4 lg:flex-row"
				>
					<div className="flex w-full grow flex-col flex-wrap justify-start gap-4 lg:w-auto">
						<h3 className="text-xl font-bold text-blue-900">Aggiungi Seminario</h3>
						<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
							<label className="text-lg font-semibold leading-5">Titolo :</label>
							<input
								type="text"
								required
								className="w-full flex-grow px-3 py-1 font-semibold border-2 sm:w-auto"
								{...register('name', {
									required: true
								})}
							/>
						</div>
						<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
							<label className="text-lg font-semibold leading-5">Cover URL :</label>
							<input
								type="text"
								required
								className="w-full flex-grow px-3 py-1 font-semibold border-2 sm:w-auto"
								{...register('img', {
									required: true
								})}
							/>
						</div>
						<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
							<label className="text-lg font-semibold leading-5">Lunghezza (ore):</label>
							<input
								type="number"
								min="0"
								max="20"
								maxLength="2"
								className="w-full flex-grow px-3 py-1 font-semibold border-2 sm:w-auto"
								{...register('lengthHr')}
							/>
						</div>
						<div>
							<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
								<label className="text-lg font-semibold leading-5">Lunghezza (min):</label>
								<input
									type="number"
									min="0"
									max="2000"
									maxLength="4"
									required
									className="w-full flex-grow px-3 py-1 font-semibold border-2 sm:w-auto"
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
							<img src={watch('img')} className="h-48-md object-contain drop-shadow-md lg:h-64" />
						)}
						<button
							className="w-full min-w-fit items-center px-2 py-1 text-center font-medium text-white bg-black disabled:to-slate-400 lg:w-24 xl:w-32 xl:text-xl"
							type="submit"
							disabled={isAddingSeminario}
						>
							{isAddingSeminario ? 'Processing...' : 'ADD +'}
						</button>
					</div>
				</form>
				<div className="relative mt-7 mb-8">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<MagnifyingGlassIcon className="h-5 w-5 stroke-2 text-gray-500" />
					</div>
					<input
						type="search"
						className="block w-full border border-gray-300 p-2 pl-10 text-gray-900"
						placeholder="Cerca seminario"
						{...register('search')}
					/>
				</div>

				<h2 className="text-3xl font-bold text-black">Lista dei Seminari</h2>
				<div className="mt-2">
					{isFetchingSeminariDone ? (
						<SeminarioLists seminari={seminari} search={watch('search')} handleDelete={handleDelete} />
					) : (
						<Loading />
					)}
				</div>
			</div>
		</div>
	)
}

export default Seminario
