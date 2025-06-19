import { TrashIcon } from '@heroicons/react/24/solid'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

// Component that displays a list of seminars
// Componente che mostra una lista di seminari
const SeminarioLists = ({ seminari, search, handleDelete }) => {

	// Filter seminars based on the search string (case-insensitive)
	// Filtra i seminari in base alla stringa di ricerca (senza distinzione tra maiuscole/minuscole)
	const seminariList = seminari?.filter((seminario) => seminario.name.toLowerCase().includes(search?.toLowerCase() || ''))

	// If there are filtered seminars, show them in a responsive grid
	// Se ci sono seminari filtrati, mostrarli in una griglia responsiva
	return !!seminariList.length ? (
		<div className="grid grid-cols-1 gap-4 bg-slate-50 p-4 drop-shadow-md lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 min-[1920px]:grid-cols-5">
			{seminariList.map((seminario, index) => {
				return (
					<div key={index} className="flex min-w-fit flex-grow bg-white drop-shadow-md">
						<img src={seminario.img} className="h-36 object-contain drop-shadow-md sm:h-48" />
						<div className="flex flex-grow flex-col justify-between p-2">
							<div>
								<p className="text-lg font-semibold sm:text-xl">{seminario.name}</p>
								<p>Lunghezza : {seminario.length || '-'} min.</p>
							</div>
							<button
								className="flex w-fit items-center gap-1 self-end bg-red-500 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:bg-red-600"
								onClick={() => handleDelete(seminario)}
							>
								Elimina
								<TrashIcon className="h-5 w-5" />
							</button>
						</div>
					</div>
				)
			})}
		</div>
	) : (
		// If no seminars are found, show a message with info icon
		// Se non ci sono seminari, mostra un messaggio con icona info
		<div className='text-black'><InformationCircleIcon className="inline-block h-5 w-5 mr-1" />Nessun seminario trovato</div>
	)
}

export default SeminarioLists
