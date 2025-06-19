/**
 * DipLists component displays a searchable list of departments ("dips"),
 * allows an admin user to add new departments,
 * and manages selection of a department.
 * Shows loading while fetching dips and uses toast notifications for feedback.
 *
 * Componente DipLists mostra una lista ricercabile di dipartimenti ("dips"),
 * permette all'admin di aggiungere nuovi dipartimenti,
 * e gestisce la selezione di un dipartimento.
 * Mostra uno spinner durante il caricamento e usa notifiche toast per feedback.
 */

import { MagnifyingGlassIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import axios from 'axios' // HTTP requests library / Libreria per richieste HTTP
import { useState } from 'react' // React hook for state management / Hook di React per gestione stato
import { useForm } from 'react-hook-form' // Library to manage forms / Libreria per gestione form
import { toast } from 'react-toastify' // Library for notifications / Libreria per notifiche
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
	// React Hook Form utilities for form handling
	// Utilità di React Hook Form per la gestione del form
	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors }
	} = useForm()

	// State to indicate if adding a new dip is in progress
  	// Stato per indicare se si sta aggiungendo un nuovo dipartimento
	const [isAdding, SetIsAdding] = useState(false)

	// Function to handle adding a new dip
  	// Funzione per gestire l'aggiunta di un nuovo dipartimento
	const onAddDip = async (data) => {
		try {
			SetIsAdding(true) // Disable button and show loading text / Disabilita bottone e mostra testo caricamento

			// Send POST request to backend with auth token to add new dip
      		// Invia richiesta POST al backend con token di autenticazione per aggiungere il nuovo dipartimento
			const response = await axios.post('/dip', data, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})
			reset() // Clear input field after successful submission / Pulisce il campo input dopo invio con successo

			fetchDips(data.name) // Refresh dips list, optionally filtered by new dip name / Aggiorna lista dips, filtrando eventualmente per il nuovo nome

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
			SetIsAdding(false) // Re-enable submit button / Riabilita il bottone di invio
		}
	}

	const DipLists = ({ dips }) => {
		// Filter dips by search input (case insensitive)
    	// Filtra i dipartimenti in base al testo di ricerca (case insensitive)
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
