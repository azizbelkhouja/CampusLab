import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Loading from './Loading'
const LabLists = ({
	labs,
	selectedLabIndex,
	setSelectedLabIndex,
	fetchLabs,
	auth,
	isFetchingLabs = false
}) => {
	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors }
	} = useForm()

	const [isAdding, SetIsAdding] = useState(false)

	const onAddLab = async (data) => {
		try {
			SetIsAdding(true)
			const response = await axios.post('/lab', data, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			// console.log(response.data)
			reset()
			fetchLabs(data.name)
			toast.success('Aggiunto laboratorio con successo!', {
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
			SetIsAdding(false)
		}
	}

	const LabLists = ({ labs }) => {
		const labsList = labs?.filter((lab) =>
			lab.name.toLowerCase().includes(watch('search')?.toLowerCase() || '')
		)

		return labsList.length ? (
			labsList.map((lab, index) => {
				return labs[selectedLabIndex]?._id === lab._id ? (
					<button
						className="w-fit rounded-md bg-gradient-to-br from-indigo-800 to-blue-700 px-2.5 py-1.5 text-lg font-medium text-white drop-shadow-xl hover:from-indigo-700 hover:to-blue-600"
						onClick={() => {
							setSelectedLabIndex(null)
							sessionStorage.setItem('selectedLabIndex', null)
						}}
						key={index}
					>
						{lab.name}
					</button>
				) : (
					<button
						className="w-fit rounded-md bg-gradient-to-br from-indigo-800 to-blue-700 px-2 py-1 font-medium text-white drop-shadow-md hover:from-indigo-700 hover:to-blue-600"
						onClick={() => {
							setSelectedLabIndex(index)
							sessionStorage.setItem('selectedLabIndex', index)
						}}
						key={index}
					>
						{lab.name}
					</button>
				)
			})
		) : (
			<div>Nessun laboratorio trovato</div>
		)
	}

	return (
		<>
			<div className="mx-4 flex h-fit flex-col gap-4 rounded-md bg-gradient-to-br from-indigo-200 to-blue-100 p-4 text-gray-900 drop-shadow-xl sm:mx-8 sm:p-6">
				<form
					className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
					onSubmit={handleSubmit(onAddLab)}
				>
					<h2 className="text-3xl font-bold">Lab Lists</h2>
					{auth.role === 'admin' && (
						<div className="flex w-fit grow sm:justify-end">
							<input
								placeholder="Type a lab name"
								className="w-full grow rounded-l border border-gray-300 px-3 py-1 sm:max-w-xs"
								required
								{...register('name', { required: true })}
							/>
							<button
								disabled={isAdding}
								className="flex items-center whitespace-nowrap rounded-r-md bg-gradient-to-r from-indigo-600 to-blue-500 px-2 py-1 font-medium text-white hover:from-indigo-500 hover:to-blue-400 disabled:from-slate-500 disabled:to-slate-400"
							>
								{isAdding ? 'Elaborazione...' : 'AGGIUNGI +'}
							</button>
						</div>
					)}
				</form>
				<div className="relative">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<MagnifyingGlassIcon className="h-5 w-5 stroke-2 text-gray-500" />
					</div>
					<input
						type="search"
						className="block w-full rounded-lg border border-gray-300 p-2 pl-10 text-gray-900"
						placeholder="Cerca un laboratorio..."
						{...register('search')}
					/>
				</div>
				{isFetchingLabs ? (
					<Loading />
				) : (
					<div className="flex flex-wrap items-center gap-3">
						<LabLists labs={labs} />
					</div>
				)}
			</div>
		</>
	)
}

export default LabLists
