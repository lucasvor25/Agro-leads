import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeAgo',
    standalone: true
})
export class TimeAgoPipe implements PipeTransform {

    transform(value: Date | string): string {
        if (!value) return '';

        const date = new Date(value);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        // Lógica simples de intervalos
        const intervals: { [key: string]: number } = {
            'ano': 31536000,
            'mês': 2592000,
            'semana': 604800,
            'dia': 86400,
            'hora': 3600,
            'minuto': 60
        };

        let counter;
        for (const i in intervals) {
            counter = Math.floor(seconds / intervals[i]);
            if (counter > 0) {
                if (counter === 1) {
                    return `há 1 ${i}`; // Ex: há 1 dia
                } else {
                    // Plural simples
                    const unit = i === 'mês' ? 'meses' : i + 's';
                    return `há ${counter} ${unit}`; // Ex: há 5 dias
                }
            }
        }
        return 'agora mesmo';
    }
}