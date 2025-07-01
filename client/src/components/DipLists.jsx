import { MagnifyingGlassIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Loading from './Loading'

const DipLists = ({
	dips,
	selectedDipIndex,
	setSelectedDipIndex,
	fetchDips,
	auth,
	isFetchingDips = false
}) => {
	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors }
	} = useForm()

	const [isAdding, SetIsAdding] = useState(false)

	const onAddDip = async (data) => {
		try {
			SetIsAdding(true)
			const response = await axios.post('/dip', data, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			reset()
			fetchDips(data.name)
			toast.success('Aggiunto dipartimento con successo!', {
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

	const DipLists = ({ dips }) => {

		const dipsList = dips?.filter((dip) =>
			dip.name.toLowerCase().includes(watch('search')?.toLowerCase() || '')
		)

		return dipsList.length ? (
			dipsList.map((dip, index) => {
				return dips[selectedDipIndex]?._id === dip._id ? (
					<button
					className="w-fit px-2.5 py-1.5 font-medium text-black border-b-2 border-black bg-gray-200"
					onClick={() => {

						setSelectedDipIndex(null)
							sessionStorage.setItem('selectedDipIndex', null)
						}}
						
						key={index}
					>
						{dip.name}
					</button>
				) : (
					<button
						className="w-fit px-2.5 py-1.5 font-medium text-black"
						onClick={() => {
							setSelectedDipIndex(index)
							sessionStorage.setItem('selectedDipIndex', index)
						}}
						key={index}
					>
						{dip.name}
					</button>
				)
			})
		) : (
			<div className="text-white"><InformationCircleIcon className="inline-block h-5 w-5 mr-1" />Nessun Dipartimento trovato</div>
		)
	}

	return (
		<>
			<div className="mx-4 flex h-fit flex-col gap-4 text-gray-900 sm:mx-8 sm:p-6">
				<form
					className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2"
					onSubmit={handleSubmit(onAddDip)}
				>
					<h2 className="text-3xl font-bold text-black">Lista dei Dipartimenti</h2>
					{auth.role === 'admin' && (
						<div className="flex w-fit grow sm:justify-end">
							<input
								placeholder="Aggiungi un Dipartimento..."
								className="w-full grow border border-black px-3 py-1 sm:max-w-xs"
								required
								{...register('name', { required: true })}
							/>
							<button
								disabled={isAdding}
								className="flex items-center whitespace-nowrap border-black border border-l-0 text-black px-3 disabled:from-slate-500 disabled:to-slate-400"
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
						className="block w-full border border-black p-2 pl-10 text-gray-900"
						placeholder="Cerca un Dipartimento..."
						{...register('search')}
					/>
				</div>
				{isFetchingDips ? (
					<Loading />
				) : (
					<div className="flex flex-wrap items-center gap-3">
						<DipLists dips={dips} />
					</div>
				)}
			</div>
		</>
	)
}

export default DipLists
